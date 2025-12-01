from flask import Flask, render_template, request
import mysql.connector

app = Flask(__name__)

def connect_db():
    return mysql.connector.connect(
        host = "localhost",
        user = "root",
        password = "Tian1027#",
        database = "course_selection_system"
    )