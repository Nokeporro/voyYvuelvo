#!/usr/bin/env bash
# Ejecutar una vez en cada EC2 Ubuntu 24.04 x86_64.
set -euo pipefail
sudo apt-get update
sudo apt-get install -y docker.io curl
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
echo 'Cierre la sesión SSH y vuelva a ingresar para usar Docker sin sudo.'
