output "cluster_name" {
  description = "Nom du cluster kind créé"
  value       = kind_cluster.driftly.name
}

output "cluster_endpoint" {
  description = "Endpoint de l'API Kubernetes"
  value       = kind_cluster.driftly.endpoint
}

output "kubeconfig" {
  description = "Chemin du kubeconfig généré"
  value       = kind_cluster.driftly.kubeconfig_path
  sensitive   = true
}

output "app_namespace" {
  description = "Namespace de l'application"
  value       = kubernetes_namespace.driftly.metadata[0].name
}

output "next_steps" {
  description = "Commandes à exécuter après terraform apply"
  value       = <<-EOT
    L'infrastructure est prête. Déployez l'application :

      kubectl apply -f ../k8s/
      kubectl get pods -n driftly -w

    Accès :
      curl http://localhost:30000/api/health

    Grafana (si monitoring activé) :
      kubectl port-forward svc/monitoring-grafana 3001:80 -n monitoring
  EOT
}
