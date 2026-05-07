variable "cluster_name" {
  description = "Nom du cluster kind"
  type        = string
  default     = "driftly"
}

variable "app_namespace" {
  description = "Namespace Kubernetes pour l'application"
  type        = string
  default     = "driftly"
}

variable "app_image" {
  description = "Image Docker à charger dans kind"
  type        = string
  default     = "driftly:latest"
}

variable "enable_monitoring" {
  description = "Installer Prometheus + Grafana"
  type        = bool
  default     = true
}
