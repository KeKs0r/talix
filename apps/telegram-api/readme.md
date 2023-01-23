# Test Deployment

```bash
gcloud run deploy pipeline-run \
    --region=europe-west1 \
    --source=./dist

```

### Deployment

-   Setup all APIs when GCP Complains
-   Create Deployment Service Account with these Roles:
    -   Artifact Registry Administrator
    -   Cloud Build Editor
    -   Cloud Run Admin
    -   Service Usage Consumer
    -   Storage Admin

```bash
gcloud projects add-iam-policy-binding lf-data \
    --member="serviceAccount:deploy-cloud-run@lf-data.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
```

Service Account running cloud run: `232272302216-compute@developer.gserviceaccount.com`

### Original Setup (only once)

Source of these commands: https://cloud.google.com/run/docs/tutorials/pubsub#integrating-pubsub

Create Service Account

```bash
gcloud iam service-accounts create cloud-run-pubsub-invoker \
    --display-name "Cloud Run Pub/Sub Invoker"
```

Assign Roles

```bash
gcloud run services add-iam-policy-binding pipeline-run \
    --member=serviceAccount:cloud-run-pubsub-invoker@immaculate-355716.iam.gserviceaccount.com \
    --role=roles/run.invoker \
    --region=europe-west1
```

```bash
gcloud projects add-iam-policy-binding immaculate-355716 \
   --member=serviceAccount:service-84183845848@gcp-sa-pubsub.iam.gserviceaccount.com \
   --role=roles/iam.serviceAccountTokenCreator
```

### Connect to Redis (from cloud run)

-   Follow this tutorial:https://cloud.google.com/memorystore/docs/redis/connect-redis-instance-cloud-run

Activate VPC access

```bash
gcloud services enable vpcaccess.googleapis.com
```

Get your VPC network

```bash
gcloud redis instances describe pipe-dedupe --region europe-west1 --format "value(authorizedNetwork)"
```

Create Connector

```bash
gcloud compute networks vpc-access connectors create cloud-run-redis-connector \
--network default \
--region europe-west1 \
--range 10.8.0.0/28
```

Verify connector

```bash
gcloud compute networks vpc-access connectors describe cloud-run-redis-connector \
--region europe-west1
```

### Connect to Redis (from localhost)

Setup a instance to forward ports through

```bash
gcloud compute instances create local-redis-connect --machine-type=f1-micro --zone=europe-west1-b
```

To enable Port Forwarding

```bash
gcloud compute ssh local-redis-connect --zone=europe-west1-b -- -N -L 6379:10.241.8.227:6379
```
