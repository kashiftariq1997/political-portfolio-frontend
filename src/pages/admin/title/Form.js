import React, { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill-new"; // Rich Text editor
import "react-quill-new/dist/quill.snow.css"; // Import Quill CSS
import { useDropzone } from "react-dropzone";
import { useNavigate, useParams } from "react-router-dom";
import { createTitle, getTitleData, updateTitle } from "../../../apis";
import { getImage } from "../../../utils";

const Form = ({ initialData }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    text: "",
    active: false,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [textError, setTextError] = useState(false);
  const [fileError, setFileError] = useState(false);

  const fetchTitle = useCallback(async () => {
    const title = await getTitleData(id)
    setFormData({ text: title.text, active: title.active, image: null });
    setImagePreview(getImage(title.image));
  }, [id])

  useEffect(() => {
    if (id) {
      fetchTitle()
    }
  }, [fetchTitle, id])

  useEffect(() => {
    if (formData.image) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(formData.image);
    }
  }, [formData.image]);

  // Handle file drop
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFormData((prev) => ({
        ...prev,
        image: acceptedFiles[0],
      }));
      setFileError(false);
    },
  });

  // Handle form submission
  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (!formData.text.trim() || formData.text === "<p><br></p>" || formData.text === "") {
      setTextError(true);
      return;
    }

    if (id) {
      try {
        await updateTitle(id, formData);
        navigate("/dashboard");
      } catch (error) {
        console.error("Error updating title:", error);
      }
    } else {
      if (!formData.image) {
        setFileError(true);
        return;
      }

      try {
        await createTitle(formData);
        navigate("/dashboard");
      } catch (error) {
        console.error("Error creating title:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <form onSubmit={handleOnSubmit} className="space-y-4">
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Text</label>
        <ReactQuill
          value={formData.text}
          className="mt-2"
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, text: value }));
            setTextError(false);
          }}
        />
        {textError && (
          <p className="text-red-500 text-xs">Text is required</p>
        )}
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-2">Active</label>
        <div
          className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-300 ${formData.active ? "bg-blue-500" : "bg-gray-300"
            }`}
          onClick={() => handleInputChange({ target: { name: "active", value: !formData.active } })}
        >
          <span
            className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ${formData.active ? "translate-x-5" : "translate-x-0"
              }`}
          ></span>
        </div>
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Image</label>
        <div
          {...getRootProps()}
          className="mt-2 border-2 border-dashed border-gray-300 p-4 text-center"
        >
          <input {...getInputProps()} />
          <p>Drag & drop an image or click to select one</p>
        </div>
        {imagePreview && (
          <div className="mt-2">
            <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover" />
          </div>
        )}
        {fileError && (
          <p className="text-red-500 text-xs">Image is required</p>
        )}
      </div>

      <div className="form-group">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          {id ? "update" : "create"}
        </button>
      </div>
    </form>
  );
};

export default Form;
