import React, { useState, useEffect } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
} from "recharts";
import { BarChart2, FileText, AlertTriangle, Upload } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../services/api";
import FileUpload from "../upload/upload";
import LiveMode from "../upload/livemode";

interface Upload {
  id: string;
  name: string;
  thumbnailUrl: string;
  fileUrl: string;
}

const Dashboard: React.FC = () => {
  const [weeklyScore, setWeeklyScore] = useState({
    score: 85,
    message: "Great job this week!",
    trendData: [
      { month: "Jan", score: 75 },
      { month: "Feb", score: 80 },
      { month: "Mar", score: 85 },
    ],
  });
  const [alerts, setAlerts] = useState(3);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);

  // Access user state and actions from the auth store
  const { user, uploadFile, uploadStatus, setUploadStatus } = useAuthStore();

  const handleClearToken = () => {
    localStorage.removeItem('token'); // Replace 'token' with your actual key
    alert('Token cleared!');
    // Optional: Add navigation or state updates here
  };
  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const response = await uploadFile(file); // Using Zustand store method for file upload
        setUploadMessage(response.message || "Image processed successfully!");
        setAnnotatedImage(response.annotatedImageUrl); // Assuming the backend returns the image URL
        setShowUploadModal(true);
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploadMessage("Failed to upload or process the image.");
        setShowUploadModal(true);
      }
    }
  };

// Fetch user uploads from the server
const fetchUploads = async () => {
  try {
    const response = await authApi.fetchUploads(); // Using the API method from `api.ts`

    if (response.status === 200 && response.data.success) {
      const folderData = response.data.data;

      // Transform folder data for the frontend if needed
      const uploads = folderData.map((folder) => ({
        folderName: folder.folder,
        files: folder.files.map((file) => ({
          name: file.name,
          // Construct the correct URL for the frontend
          url: `http://localhost:5000/api/OUTPUT_FOLDER/${folder.folder}/${file.name}`
        })),
      }));

      setUploads(uploads);
      console.log("Uploads fetched successfully:", uploads);
    } else {
      console.error("Error fetching uploads:", response.data.error);
      setUploads([]); // Reset uploads on error
    }
  } catch (error) {
    console.error("Error fetching uploads:", error.message);
    setUploads([]); // Reset uploads in case of failure
  }
};

  // const fetchUploads = async () => {
  //   try {
  //     const response = await authApi.fetchUploads(); // Call the API
  
  //     if (response.status === 200 && response.data.success) {
  //       const folderData = response.data.data;
  
  //       // Check if folderData is an array
  //       if (Array.isArray(folderData)) {
  //         const uploads: Upload[] = folderData.flatMap((folder: { folderName: string; files: any[] }) =>
  //           folder.files.map((file: { name: string; url: string }) => ({
  //             id: `${folder.folderName}-${file.name}`, // Generate a unique ID
  //             name: file.name,
  //             thumbnailUrl: `http://localhost:5000/${file.url}`, // Assuming Flask serves thumbnails
  //             fileUrl: `http://localhost:5000/${file.url}`, // Full file URL
  //           }))
  //         );
  
  //         setUploads(uploads); // Set the uploads in state
  //         console.log("Uploads fetched successfully:", uploads);
  //       } else {
  //         console.error("Expected folderData to be an array, got:", folderData);
  //         setUploads([]); // Clear uploads if data is invalid
  //       }
  //     } else {
  //       console.error("Error fetching uploads:", response.data.error || "Unknown error");
  //       setUploads([]);
  //     }
  //   } catch (error: any) {
  //     console.error("Error fetching uploads:", error.message);
  //     setUploads([]);
  //   }
  // };  
  

    // Fetch uploads when the component mounts
    useEffect(() => {
      fetchUploads();
    }, []);

  // Watch for upload status changes and set upload message accordingly
  useEffect(() => {
    if (uploadStatus === "Success") {
      setUploadMessage("Upload completed successfully!");
    } else if (uploadStatus === "Failed") {
      setUploadMessage("Upload failed. Please try again.");
    }
  }, [uploadStatus]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {/* Welcome Section */}
      <div className="md:col-span-2 space-y-6">
        <div className="p-4 border rounded-lg shadow-lg">
          <h2 className="text-xl font-bold">Welcome, {"Denzil Serrao"}!</h2>
          {/*<div className="flex items-center justify-between mt-4">
            <label
              htmlFor="file-upload"
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-600 cursor-pointer"
            >
              Upload File
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
            {alerts > 0 && (
              <div className="text-red-500 flex items-center">
                <AlertTriangle className="mr-2" size={20} />
                {alerts} New Alerts
              </div>
            )}
          </div>*/}
          <div className="flex items-center justify-between mt-4">
            <FileUpload />
            <LiveMode />
            {alerts > 0 && (
              <div className="text-red-500 flex items-center">
                <AlertTriangle className="mr-2" size={20} />
                {alerts} New Alerts
              </div>
            )}
          </div>
        </div>

{/* Recent Uploads */}
<div className="p-4 border rounded-lg shadow-lg">
  <h2 className="text-xl font-bold">Recent Uploads</h2>
  {uploads.length > 0 ? (
    uploads.map((upload) => (
      <div key={upload.folderName} className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{upload.folderName}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {upload.files.map((file) => (
            <div key={file.name} className="aspect-square bg-gray-200 rounded-lg relative">
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={file.url}
                  alt={file.name || "Uploaded File"}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    // e.currentTarget.src = "fallback_image_path.jpg"; // Replace with your fallback image path
                  }}
                />
              </a>
              <p className="absolute bottom-2 left-2 bg-black text-white text-xs px-2 py-1 rounded-lg opacity-75">
                {file.name || "Unnamed"}
              </p>
            </div>
          ))}
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-600">No uploads yet.</p>
  )}
</div>

      </div>
      <div className="space-y-6">
        {/* Weekly Score */}
        <div className="p-4 border rounded-lg shadow-lg">
          <h2 className="text-xl font-bold">Weekly Score</h2>
          <div className="text-4xl font-bold text-green-600">{weeklyScore.score}</div>
          <p className="text-gray-600">{weeklyScore.message}</p>
          <div className="mt-4">
            <LineChart width={300} height={200} data={weeklyScore.trendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" />
            </LineChart>
          </div>
        </div>

        {/* Analysis */}
        <div className="p-4 border rounded-lg shadow-lg">
          <h2 className="text-xl font-bold">Analysis</h2>
          <BarChart2
            size={48}
            className="text-green-500 mb-2 hover:scale-110 transition-transform duration-300"
          />
          <p className="text-gray-600">Your cleanliness efforts are improving!</p>
        </div>

        {/* Reports & Guidelines */}
        <div className="p-4 border rounded-lg shadow-lg">
          <h2 className="text-xl font-bold">Reports & Guidelines</h2>
          <ul className="space-y-2 mt-4">
            <li className="flex items-center">
              <FileText size={20} className="mr-2 text-green-500" />
              <a
                href="#"
                className="text-blue-500 hover:underline hover:text-blue-700"
              >
                Monthly Report
              </a>
            </li>
            <li className="flex items-center">
              <FileText size={20} className="mr-2 text-green-500" />
              <a
                href="#"
                className="text-blue-500 hover:underline hover:text-blue-700"
              >
                Cleanliness Guidelines
              </a>
            </li>
          </ul>
        </div>
      </div>

      {showUploadModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
      <p className="text-lg font-semibold mb-4">{uploadMessage}</p>
      {annotatedImage ? (
        <img
          src={annotatedImage}
          alt="Annotated Upload"
          className="w-full max-h-60 object-contain rounded-lg shadow-md mb-4"
        />
      ) : (
        <p className="text-gray-500 italic mb-4">No image available</p>
      )}
      <button
        onClick={() => setShowUploadModal(false)}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Close
      </button>
    </div>
  </div>
)}
<div className="p-4">
      <h2 className="text-xl font-bold">Manage Token</h2>
      <button
        onClick={handleClearToken}
        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 mt-4"
      >
        Logout
      </button>
    </div>

    </div>
  );
};

export default Dashboard;
