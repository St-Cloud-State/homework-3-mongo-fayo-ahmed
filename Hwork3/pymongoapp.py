import os
import pymongo
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# MongoDB Connection
client = pymongo.MongoClient("mongodb://localhost:27017/")
loan_db = client['loan_database']
applications_collection = loan_db['applications']

# Utility function to generate a new application number.
# This simple implementation uses the count of documents.
# Note: In production, you would use a more robust mechanism (e.g., a separate counter collection).
def get_new_application_number():
    return applications_collection.count_documents({}) + 1

# API to accept a new loan application (Enhanced)
@app.route('/api/accept', methods=['POST'])
def accept_application():
    data = request.get_json()
    name = data.get('name')
    zipcode = data.get('zipcode')
    address = data.get('address', "")  # Enhanced: capture full address if provided

    if not name or not zipcode:
        return jsonify({'error': 'Name and Zipcode are required'}), 400

    # Check if an application with the same name and zipcode already exists
    if applications_collection.find_one({"name": name, "zipcode": zipcode}):
        existing_app = applications_collection.find_one({"name": name, "zipcode": zipcode})
        return jsonify({'error': 'Application with this name and zipcode already exists',
                        'application_number': existing_app['application_number']}), 400

    new_app_num = get_new_application_number()

    # Create a new application document with enhanced fields.
    application = {
        "application_number": new_app_num,
        "name": name,
        "zipcode": zipcode,
        "address": address,
        "status": "received",   # initial status is 'received'
        "notes": []             # initialize empty array for future notes
    }
    applications_collection.insert_one(application)

    return jsonify({'message': 'Application accepted successfully',
                    'application_number': new_app_num}), 201

# API to check the status of a loan application
@app.route('/api/status/<int:application_number>', methods=['GET'])
def check_status(application_number):
    application = applications_collection.find_one({"application_number": application_number}, {"_id": 0})
    if application:
        return jsonify({'status': application.get("status", "unknown")}), 200
    return jsonify({'error': 'Application not found'}), 404

# API to change the status of a loan application
@app.route('/api/change_status', methods=['POST'])
def change_status():
    data = request.get_json()
    application_number = data.get('application_number')
    new_status = data.get('new_status')

    if not application_number or not new_status:
        return jsonify({'error': 'Application number and new status are required'}), 400

    # Update the status field of the application document.
    result = applications_collection.update_one(
        {"application_number": application_number},
        {"$set": {"status": new_status}}
    )
    if result.modified_count > 0:
        return jsonify({'message': 'Status updated successfully'}), 200

    return jsonify({'error': 'Application not found'}), 404

# API to retrieve all loan applications (for testing purposes)
@app.route('/api/applications', methods=['GET'])
def get_all_applications():
    apps = list(applications_collection.find({}, {"_id": 0}))
    return jsonify({'applications': apps}), 200

# Render the main page.
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # Run the Flask app with debugging enabled.
    app.run(debug=True, host="0.0.0.0", port=5000)
