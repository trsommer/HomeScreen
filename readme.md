## HomeScreen Dashboard

* Same style as homer with macOs theme
* Editing window
* Live updates on save

### Install in Docker

1. 
    ``` bash
        git clone https://github.com/trsommer/HomeScreen.git 
    ```

2. ```bash
        cd HomeScreen
    ```

2. ```bash
        docker build . -t trsommer/homescreen
    ```

3. ```bash
        docker run -d \
            -p 8724:8724 \
            --name homeScreen \
            -v {public folder inside main directory}:/usr/src/app/public \
            trsommer/homescreen
    ```