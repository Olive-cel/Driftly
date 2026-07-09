terraform {
  required_version = ">= 1.5"

  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "~> 0.7"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.35"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.17"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

# ── Kind cluster ──────────────────────────────────────────

resource "kind_cluster" "driftly" {
  name           = var.cluster_name
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      extra_port_mappings {
        container_port = 30000
        host_port      = 30000
        protocol       = "TCP"
      }
      extra_port_mappings {
        container_port = 80
        host_port      = 80
        protocol       = "TCP"
      }
      extra_port_mappings {
        container_port = 443
        host_port      = 443
        protocol       = "TCP"
      }

      kubeadm_config_patches = [
        <<-EOF
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
        EOF
      ]
    }

    node {
      role = "worker"
    }
  }
}

# ── Kubernetes provider (points to the kind cluster) ─────

provider "kubernetes" {
  host                   = kind_cluster.driftly.endpoint
  cluster_ca_certificate = kind_cluster.driftly.cluster_ca_certificate
  client_certificate     = kind_cluster.driftly.client_certificate
  client_key             = kind_cluster.driftly.client_key
}

provider "helm" {
  kubernetes {
    host                   = kind_cluster.driftly.endpoint
    cluster_ca_certificate = kind_cluster.driftly.cluster_ca_certificate
    client_certificate     = kind_cluster.driftly.client_certificate
    client_key             = kind_cluster.driftly.client_key
  }
}

# ── Namespace ─────────────────────────────────────────────

resource "kubernetes_namespace" "driftly" {
  metadata {
    name = var.app_namespace
    labels = {
      "app.kubernetes.io/part-of" = "driftly"
    }
  }

  depends_on = [kind_cluster.driftly]
}

# ── Metrics Server (required for HPA on kind) ────────────

resource "helm_release" "metrics_server" {
  name             = "metrics-server"
  repository       = "https://kubernetes-sigs.github.io/metrics-server/"
  chart            = "metrics-server"
  namespace        = "kube-system"
  create_namespace = false

  set {
    name  = "args[0]"
    value = "--kubelet-insecure-tls"
  }

  depends_on = [kind_cluster.driftly]
}

# ── Ingress NGINX Controller ──────────────────────────────

resource "helm_release" "ingress_nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress-nginx"
  create_namespace = true

  set {
    name  = "controller.hostPort.enabled"
    value = "true"
  }
  set {
    name  = "controller.service.type"
    value = "NodePort"
  }
  set {
    name  = "controller.nodeSelector.ingress-ready"
    value = "true"
    type  = "string"
  }
  set {
    name  = "controller.tolerations[0].key"
    value = "node-role.kubernetes.io/control-plane"
  }
  set {
    name  = "controller.tolerations[0].operator"
    value = "Exists"
  }
  set {
    name  = "controller.tolerations[0].effect"
    value = "NoSchedule"
  }

  depends_on = [kind_cluster.driftly]
}

# ── Monitoring (Prometheus + Grafana) ─────────────────────

resource "helm_release" "monitoring" {
  count = var.enable_monitoring ? 1 : 0

  name             = "monitoring"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  namespace        = "monitoring"
  create_namespace = true

  depends_on = [kind_cluster.driftly]
}

# ── Load Docker image into kind ───────────────────────────

resource "null_resource" "load_image" {
  triggers = {
    cluster_name = kind_cluster.driftly.name
  }

  provisioner "local-exec" {
    command = "kind load docker-image ${var.app_image} --name ${var.cluster_name}"
  }

  depends_on = [kind_cluster.driftly]
}
