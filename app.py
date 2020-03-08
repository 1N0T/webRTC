#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import os
import uuid

from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler
from tornado.websocket import WebSocketHandler


rel = lambda *x: os.path.abspath(os.path.join(os.path.dirname(__file__), *x))

lista_salas = {}


class Sala(object):
    def __init__(self, nombre, clientes=[]):
        self.nombre = nombre
        self.clientes = clientes

    def __repr__(self):
        return self.nombre


class MainHandler(RequestHandler):
    def get(self):
        """Creamos un UUID para identificar la sala""" 
        sala = str(uuid.uuid4().hex.upper()[0:6])
        self. redirect('/sala/'+sala)


class RoomHandler(RequestHandler):
    def get(self, sala):
        self.render('sala.html')


class EchoWebSocket(WebSocketHandler):
    def open(self, sala):
        if sala in lista_salas:
            lista_salas[sala].clientes.append(self)
        else:
            lista_salas[sala] = Sala(sala, [self])

        self.sala = lista_salas[sala]

        if len(self.sala.clientes) > 2:
            self.write_message('sala completa')
        elif len(self.sala.clientes) == 1:
            self.write_message('sala iniciada')
        else:
            self.write_message('not hay sala')

    def on_message(self, mensaje):
        for cliente in self.sala.clientes:
            if cliente is self:
                continue
            cliente.write_message(mensaje)

    def on_close(self):
        self.sala.clientes.remove(self)


def main():
    settings = dict(
        template_path=rel('templates'),
        static_path=rel('static'),
        debug=True
    )

    application = Application([
        (r'/', MainHandler),
        (r"/sala/([^/]*)", RoomHandler),
        (r'/ws/([^/]*)', EchoWebSocket),
    ], **settings)

    application.listen(address='127.0.0.1', port=8080)
    logging.info("Started listening at 127.0.0.1:8080.")
    IOLoop.instance().start()


if __name__ == '__main__':
    main()
