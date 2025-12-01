from flask import Flask, request, render_template
import mysql.connector

app = Flask(__name__)

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Tian1027#",
    database="test"
)

cursor = db.cursor()

@app.route('/')
def form():
    return render_template('test.html')

@app.route('/submit', methods=['POST'])
def submit():
    name = request.form['name']
    password = request.form['password']
    
    sql = "INSERT INTO login_info (name, password) VALUES (%s, %s)"
    values = (name, password)
    cursor.execute(sql, values)
    db.commit()
    
    return f"Data saved! Name: {name}, Password: {password}"

if __name__ == "__main__":
    app.run(debug=True)
