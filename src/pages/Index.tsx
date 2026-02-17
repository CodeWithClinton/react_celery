import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface Student {
  reg_no: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  level: string;
}

interface UploadResult {
  task_id: string;
  status: string;
}

const API_BASE = "http://127.0.0.1:8000/api";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };


  // api call to upload students csv file
  async function fileUpload(formData: FormData) {
    try {
      const response = await axios.post(
        `${API_BASE}/upload-students-csv/`,
        formData,
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail ||
            error.response?.data?.error ||
            "Upload failed",
        );
      }
      console.error("Error uploading file:", error);
    }
  }

  // api call to fetch all students
  async function getStudents() {
    try{
      const response = await axios.get(`${API_BASE}/students/`);
      return response.data;
    }
    catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail ||
            error.response?.data?.error ||
            "Failed to fetch students",
        );
      }
      console.error("Error fetching students:", error);
    }
  }


  // async function that calls the function that uploads the students csv file
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const result = await fileUpload(formData);
      setUploadResult(result);
      setUploadError("");
      setTaskId(result.task_id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setUploadError(error.message);
      } else {
        setUploadError("An unknown error occurred.");
      }
    } finally {
      setUploading(false);
    }
  };


   // Poll task status
  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      const response = await axios.get(`${API_BASE}/task-status/${taskId}/`);
      const data = response.data;

      

     
      setUploadResult((prev) => prev ? { ...prev, status: data.status } : null);

      if (data.status === "SUCCESS" || data.status === "FAILURE") {
        clearInterval(interval);
      }
    }, 2000); // poll every 2 seconds

    return () => clearInterval(interval);
  }, [taskId]);


  // useEffect to fetch students when the component mounts and when the upload is successful
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const data = await getStudents();
        setStudents(data);
        setStudentsError("");
      } catch (error: unknown) {
        if (error instanceof Error) {
          setStudentsError(error.message);
        } else {
          setStudentsError("An unknown error occurred while fetching students.");
        }
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [uploadResult]); // refetch students after a successful upload


  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Student CSV Upload</h1>

      <div className="flex items-center gap-3 mb-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="max-w-xs"
        />
        <Button onClick={handleUpload} disabled={!file || uploading || uploadResult?.status === "PENDING"}>
          {uploading || (uploadResult && uploadResult.status === "PENDING") ? "Uploading…" : "Upload"}
        </Button>
      </div>

      {uploadError && (
        <p className="text-destructive text-sm mb-4">{uploadError}</p>
      )}
      {uploadResult && (
        <p className="text-sm mb-4 text-muted-foreground">
          Task ID: <span className="font-mono">{uploadResult.task_id}</span> —
          Status: {uploadResult.status}
        </p>
      )}

      {studentsError && (
        <p className="text-destructive text-sm mb-2">{studentsError}</p>
      )}
      {loadingStudents && students.length === 0 && (
        <p className="text-sm text-muted-foreground">Loading students…</p>
      )}

      {students.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reg No</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s) => (
              <TableRow key={s.reg_no}>
                <TableCell>{s.reg_no}</TableCell>
                <TableCell>{s.first_name}</TableCell>
                <TableCell>{s.last_name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.department}</TableCell>
                <TableCell>{s.level}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Index;
