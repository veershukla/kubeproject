# Hello World — Kubernetes on kind

Node.js app deployed via ArgoCD + Helm on a local kind cluster.

## Prerequisites

```bash
brew install kind helm argocd
```

## Step 1: Push to GitHub

1. Create a GitHub repo and push this project.
2. Add two secrets in GitHub → Settings → Secrets → Actions:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
3. Update `helm/hello-world/values.yaml` → set `image.repository` to your Docker Hub username.

## Step 2: Local kind cluster

```bash
kind create cluster --name hello-world
```

## Step 3: Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl wait --for=condition=available deployment/argocd-server -n argocd --timeout=120s
```

## Step 4: Access ArgoCD UI

```bash
# In a separate terminal — keep this running
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get the initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo

# Login
argocd login localhost:8080 --username admin --insecure
```

Open https://localhost:8080 in your browser (accept the self-signed cert).

## Step 5: Deploy with ArgoCD

```bash
argocd app create hello-world \
  --repo https://github.com/YOUR_USERNAME/YOUR_REPO \
  --path helm/hello-world \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --helm-set image.repository=YOUR_DOCKERHUB_USERNAME/hello-world \
  --sync-policy automated

argocd app sync hello-world
argocd app get hello-world
```

## Step 6: Test the app

```bash
kubectl port-forward svc/hello-world 3000:80
curl http://localhost:3000
# {"message":"Hello from Kubernetes!","version":"1.0.0"}
```

## How it all works

```
git push → GitHub Actions builds & pushes Docker image to Docker Hub
                                                        ↓
ArgoCD polls GitHub repo → detects Helm chart changes → deploys to kind cluster
```
