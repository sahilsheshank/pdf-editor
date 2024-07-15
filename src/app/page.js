'use client';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Document, Page, pdfjs } from 'react-pdf';


pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.mjs';
export default function Home() {
  const [numPages, setNumPages] = useState(null);
  const [fieldNames, setFieldNames] = useState([]);
  const [error, setError] = useState('');
  const [modifiedPdf, setModifiedPdf] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address1: "",
    mobile: "",
    email: "",
    pinCode: "",
  });
  const [pdfDoc, setPdfDoc] = useState(null);
  console.log(formData)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {


      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPdfDoc(pdfDoc);  
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        const fieldNames = fields.map((field) => field.getName());


        setFieldNames(fieldNames);

      } catch (error) {
        console.error(error);
        setError(error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pdfDoc) {
      
        const form = pdfDoc.getForm();

        const nameField = form.getTextField('Customer Name');

        const addressField = form.getTextField('Customer Address1');
        const mobileField = form.getTextField('Customer Mobile');
        const emailField = form.getTextField('Customer email');
        const pinCodeField = form.getTextField('Pin Code');

        nameField.setText(formData.name);
        addressField.setText(formData.address1);
        mobileField.setText(formData.mobile);
        emailField.setText(formData.email);
        pinCodeField.setText(formData.pinCode);

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setModifiedPdf(url);
        
      
    } 
    else {
      setError('upload a PDF file.');
    }
  };

  return (
    <div className='h-screen m-10'>
     
      
      <form onSubmit={handleSubmit} className='flex flex-col items-center justify-center gap-4'>
      <h1>upload only an editable pdf to see results</h1>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          id='pdf'
        />
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <div>
          <label>
            Address1:
            <input
              type="text"
              name="address1"
              value={formData.address1}
              placeholder='upto 6 letters'
              onChange={handleInputChange}
            />
          </label>
        </div>
        <div>
          <label>
            Mobile:
            <input
              maxLength={10}
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <div>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <div>
          <label>
            PinCode:
            <input
              type="text"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <button  className='border bg-green-500 rounded-xl p-2 m-4 my-4 ' type='submit'>Submit Data</button>
      </form>
      
      {modifiedPdf && (
        <div className='flex flex-col justify-center items-center'>
          {modifiedPdf?
          <a href={modifiedPdf} className='border bg-green-500 rounded-xl p-2 m-4 my-4 ' download="modified.pdf">
          Download Modified PDF
        </a> : <p>no pdf available</p> 
        }
        </div>
      )}
       <div className='flex justify-center items-center w-full'>
        <Document
          file={modifiedPdf}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page  key={`page_${index + 1}`} pageNumber={index + 1} />
          ))}
        </Document>
      </div>
    </div>
  );
}
