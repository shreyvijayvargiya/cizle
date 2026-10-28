# Kubernetes taste

By @f · developer
Language: en · Domains: product, engineering · Source: P01

Source page: https://prompts.chat

```
# Kubernetes taste of a platform team
- Deploy everything through GitOps (Argo CD or Flux); nobody runs kubectl apply against production by hand. Confidence: 0.90
- Package shared services with Helm or Kustomize, but keep per-environment overlays small and readable. Confidence: 0.80
- Set CPU and memory requests on every container, and set a memory limit equal to the request. Confidence: 0.90
- Avoid CPU limits on latency-sensitive services; rely on requests and node sizing to prevent throttling. Confidence: 0.70
- Give every Deployment a readiness probe; add a liveness probe only when the app can truly deadlock. Confidence: 0.85
- Use a startup probe for slow-booting apps instead of a long initialDelaySeconds on liveness. Confidence: 0.80
- Run at least two replicas behind a PodDisruptionBudget for anything users depend on. Confidence: 0.90
- Spread replicas across zones with topologySpreadConstraints. Confidence: 0.80
- Pin images by digest or an immutable version tag, never latest. Confidence: 0.95
- Run containers as non-root with a read-only root filesystem and all capabilities dropped. Confidence: 0.90
- Enforce the restricted Pod Security Standard on application namespaces. Confidence: 0.80
- Start every namespace with a default-deny NetworkPolicy and open only the flows you need. Confidence: 0.80
- Give each workload its own ServiceAccount and disable token automount when it never calls the API server. Confidence: 0.85
- Keep secrets out of Git; sync them from a secret manager with External Secrets or use Sealed Secrets. Confidence: 0.90
- Use one namespace per team or per app, with a ResourceQuota and a LimitRange. Confidence: 0.80
- Apply the standard app.kubernetes.io labels to every resource. Confidence: 0.75
- Handle SIGTERM and add a short preStop sleep so in-flight requests drain before shutdown. Confidence: 0.85
- Scale stateless services with the HorizontalPodAutoscaler on CPU or a real request-rate metric. Confidence: 0.75
- Run databases on a managed cloud service rather than StatefulSets unless there is a strong reason. Confidence: 0.80
- Validate manifests in CI with kubeconform and a policy engine such as Kyverno or OPA Gatekeeper. Confidence: 0.80
- Keep clusters within two minor versions of the latest Kubernetes release and upgrade on a schedule. Confidence: 0.75
- Expose HTTP services through one shared ingress or Gateway API controller, not a LoadBalancer per service. Confidence: 0.75
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
