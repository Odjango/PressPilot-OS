#!/bin/bash
# Install WP-CLI inside the SPECIFIC running container
# Container: wordpress-moosc0gwkg48kss04c8cgkc4

echo "Entering container wordpress-moosc0gwkg48kss04c8cgkc4..."

docker exec -it wordpress-moosc0gwkg48kss04c8cgkc4 bash -c '
    echo "Downloading WP-CLI..."
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    
    echo "Making executable..."
    chmod +x wp-cli.phar
    
    echo "Moving to global bin..."
    mv wp-cli.phar /usr/local/bin/wp
    
    echo "Verifying..."
    wp --info --allow-root
    
    echo "Success! WP-CLI is installed."
'
