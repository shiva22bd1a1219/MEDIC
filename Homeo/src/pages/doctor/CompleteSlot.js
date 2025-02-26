import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';
import image from '../../images/image.jpg';

const CompleteSlot = () => {
  const { tokenId } = useParams();
  const [appointmentData, setAppointmentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_BACKEND_URL + `/bookingAppointments/token/${tokenId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch appointment data');
        }
        const data = await response.json();
        setAppointmentData(data);
        if (data.status === "completed") {
          setIsCompleted(true);
        } else if (data.status === "cancel") {
          setIsCancel(true);
        }
      } catch (error) {
        console.error('Error fetching appointment data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentData();
  }, [tokenId]);

  // New function: Create Purchase Order using the new endpoint and DTO payload
  const createPurchaseOrder = async () => {
    try {
      // Define purchase order items.
      // (Ensure that the keys below match what your backend DTO expects.)
      const poItems = [
        {
          description: "Nonsteroidal anti-inflammatory drug",
          expiryDate: "2024-11-30",
          manufacturer: "HealthCorp",
          name: "Ibuprofen",
          quantityOrdered: 30,
          unit: "tablet"
        },
        {
          description: "Antibiotic for bacterial infections",
          expiryDate: "2026-06-30",
          manufacturer: "MedLife",
          name: "Amoxicillin",
          quantityOrdered: 100,
          unit: "capsule"
        },
        {
          description: "Antihistamine for allergies",
          expiryDate: "2025-07-31",
          manufacturer: "AllergyPharma",
          name: "Cetirizine",
          quantityOrdered: 75,
          unit: "tablet"
        }
      ];

      // Build the purchase order payload.
      const payload = {
        orderDate: new Date().toISOString(),
        status: "PENDING",
        // Assuming the supplier ID comes from your business logic (here we use 102 as an example)
        supplierId: 102,
        purchaseOrderItems: poItems
      };

      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + '/purchase-orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create purchase order');
      }
      const data = await response.json();
      console.log('Purchase Order created:', data);
    } catch (error) {
      console.error('Error creating purchase order:', error);
    }
  };

  const handleAppointmentCompleted = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `/bookingAppointments/completed-appointment/${tokenId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark appointment as completed');
      }
      const data = await response.json();
      console.log('Appointment completed:', data);
      setIsCompleted(true);

      // Create purchase order after successful appointment completion
      await createPurchaseOrder();
    } catch (error) {
      console.error('Error completing appointment:', error);
      setError('Failed to complete the appointment. Please try again.');
    }
  };

  const handlePrescriptionUpload = async () => {
    if (!prescriptionFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', prescriptionFile);

      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `/bookingAppointments/${appointmentData.bookingId}/prescription`,
        {
          method: 'PUT',
          body: formData
        }
      );
      if (!response.ok) {
        throw new Error('Failed to upload prescription image');
      }
      const updatedData = await response.json();
      setAppointmentData(updatedData);
      setPrescriptionFile(null);
    } catch (error) {
      console.error('Error uploading prescription:', error);
      setUploadError('Failed to upload prescription image. Please try again.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!appointmentData) {
    return <div>Error: Appointment data is not available</div>;
  }

  // Fallback profile image
  const profilePic = image;

  return (
    <>
      <PatientNavbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="bg-white p-16 rounded-lg shadow-lg w-[80%] text-center">
          <h1 className="text-3xl font-semibold mb-8">
            Thanks for booking with Dr. {appointmentData.doctor.username}!
          </h1>

          <div className="gap-8 mb-8">
            <div className="bg-gray-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Patient Details</h2>
              <img
                src={profilePic}
                alt={`Patient ${appointmentData.patient.username}`}
                className="w-40 h-40 rounded-full object-cover mb-4 m-auto"
              />
              <p>
                <strong>Name:</strong> {appointmentData.patient.username}
              </p>
              <p>
                <strong>Patient ID:</strong>{' '}
                {appointmentData.patient.patientDetails ? appointmentData.patient.patientDetails.id : 'N/A'}
              </p>
              <p>
                <strong>Phone:</strong> {appointmentData.patient.phoneNumber}
              </p>
              <p>
                <strong>Email:</strong> {appointmentData.patient.email}
              </p>
            </div>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
            <p>
              <strong>Token:</strong> {appointmentData.token}
            </p>
            <p>
              <strong>Date:</strong> {appointmentData.scheduleId.date}
            </p>
            <p>
              <strong>Time:</strong> {appointmentData.scheduleId.startTime} - {appointmentData.scheduleId.endTime}
            </p>
            <p>
              <strong>Status:</strong> {appointmentData.status}
            </p>
          </div>

          {appointmentData.prescriptionImageUrl ? (
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-xl font-semibold mb-4">Prescription</h2>
              <img
                src={appointmentData.prescriptionImageUrl}
                alt="Prescription"
                className="w-40 h-40 object-cover mb-4 border rounded-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-xl font-semibold mb-4">No Prescription Uploaded</h2>
            </div>
          )}

          <div className="flex flex-col items-center mb-8 border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Prescription (Doctor Only)</h2>
            <input
              type="file"
              onChange={(e) => setPrescriptionFile(e.target.files[0])}
              className="mb-4"
            />
            {uploadError && <div className="text-red-500 mb-2">{uploadError}</div>}
            <button
              onClick={handlePrescriptionUpload}
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Upload Prescription
            </button>
          </div>

          <button
            onClick={handleAppointmentCompleted}
            className={`${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            } ${isCancel ? 'bg-red-500' : 'bg-blue-500'} text-white py-3 px-6 rounded-lg mb-8`}
            disabled={isCompleted || isCancel}
          >
            {isCancel
              ? 'Appointment Cancelled'
              : isCompleted
              ? 'Appointment Completed'
              : 'Mark Appointment as Completed'}
          </button>

          {error && <div className="text-red-500">{error}</div>}

          <div className="text-left">
            <div className="mb-4">
              <strong>Need help?</strong>
              <p className="text-gray-500 text-sm">
                Have questions? You can always reach out to our support team.
              </p>
            </div>
            <div className="mb-4">
              <strong>Reminder</strong>
              <p className="text-gray-500 text-sm">
                We'll send you a reminder email 24 hours before your appointment.
              </p>
            </div>
            <div>
              <strong>Manage your appointment</strong>
              <p className="text-gray-500 text-sm">
                You can manage your appointment or cancel it from your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompleteSlot;
