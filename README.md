![logo](https://raw.github.com/1N0T/images/master/global/1N0T.png)
# webRTC

Este repositorio es una prueba de concepto de **webRTC**. Se ha utilizado **tornado** para implementar un servidor con **websocket** en **python** requerido para establecer la conexión **pear-to-pear** entre dos exploradores.

El acceso vía **http** sólo está permitido desde **localhost**. Para poder acceder remotamente, se ha añadido un certificado autofirmado generado con el siguiente comando.

```bash
mkdir certificates
cd certificates
openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 3650 -out certificate.pem
```
Para crear el entorno virtual python, y ejecutar el servidor web.
```bash
python3 -m venv venv
source venv/bin/activate
pip3 install tornado
python3 app.py
```
