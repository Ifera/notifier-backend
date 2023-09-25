### Docker Build CMD:

- `docker build -t notifier-backend .`
- `docker run -d -p 3000:3000 --name nb notifier-backend`
- `docker run -d -p 3000:3000 -v $(pwd):/app --name nb notifier-backend`
- `docker logs -f nb`
- `docker exec -it nb sh`
