import React, { useState, useEffect } from "react";
import getWeb3 from "./getWeb3";
import patientRecordContract from "./contracts/AddPatientRecord.json"; // ABI của hợp đồng AddPatientRecord
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function AddPatientRecord() {
    const [contract, setContract] = useState(null);
    const [files, setFiles] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [accounts, setAccounts] = useState(null);
    const [newRecord, setNewRecord] = useState({
        username: "",
        fullName: "",
        dateOfBirth: "",
        hometown: "",
        occupation: "",
        cccd: "",
        healthInsuranceNumber: "",
        admissionDateTime: "",
        mriOrXrayCIDs: [],
        diagnosis: "",
        medicalHistory: "",
        conclusion: ""
    });
    const navigate = useNavigate();
    const { username } = useParams();

    useEffect(() => {
        const init = async () => {
            try {
                const web3 = await getWeb3();
                const networkId = await web3.eth.net.getId();
                const deployedNetwork = patientRecordContract.networks[networkId];

                if (!deployedNetwork || !deployedNetwork.address) {
                    throw new Error("Hợp đồng không được triển khai trên mạng này.");
                }

                const contractInstance = new web3.eth.Contract(
                    patientRecordContract.abi,
                    deployedNetwork.address
                );

                setContract(contractInstance);
                const accounts = await web3.eth.getAccounts();
                setAccounts(accounts);

                setNewRecord((prevState) => ({
                    ...prevState,
                    username: username || ""
                }));
            } catch (error) {
                console.error("Lỗi khi kết nối với blockchain:", error);
            }
        };

        init();
    }, [username]);

    const handleFilesChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleUploadToPinata = async () => {
        if (files.length === 0) {
            alert("Vui lòng chọn ít nhất một tệp ảnh.");
            return;
        }

        const pinataApiKey = "1d570e375d82ae085962";
        const pinataSecretApiKey = "d3fb38e777a9d31064b463aa79d55d45ea95c037e4571b3c514c9f1983f39a47";

        try {
            const cidArray = await Promise.all(files.map(async (file) => {
                const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
                let data = new FormData();
                data.append("file", file);

                const res = await axios.post(url, data, {
                    headers: {
                        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
                        pinata_api_key: pinataApiKey,
                        pinata_secret_api_key: pinataSecretApiKey,
                    },
                });

                return res.data.IpfsHash;
            }));

            const ipfsUrls = cidArray.map(cid => `https://gateway.pinata.cloud/ipfs/${cid}`);
            setImageUrls(ipfsUrls);
            setNewRecord((prevState) => ({
                ...prevState,
                mriOrXrayCIDs: cidArray
            }));
            alert("Tải ảnh lên thành công!");
        } catch (error) {
            console.error("Lỗi khi tải ảnh lên:", error);
            alert("Không thể tải ảnh lên.");
        }
    };

    const handleChange = (e) => {
        setNewRecord({
            ...newRecord,
            [e.target.name]: e.target.value
        });
    };
    const handleBack = () => {
        navigate(-1); // Trở về trang trước đó
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();

        if (!newRecord.fullName) {
            alert("Tên bệnh nhân là bắt buộc.");
            return;
        }

        try {
            await contract.methods
                .addRecord(
                    newRecord.fullName,
                    newRecord.dateOfBirth,
                    newRecord.hometown,
                    newRecord.occupation,
                    newRecord.cccd,
                    newRecord.healthInsuranceNumber,
                    newRecord.admissionDateTime,
                    newRecord.mriOrXrayCIDs,
                    newRecord.diagnosis,
                    newRecord.medicalHistory,
                    newRecord.conclusion
                )
                .send({ from: accounts[0], gas: 3000000 });

            alert("Thêm hồ sơ bệnh án thành công!");

            // Chuyển hướng và truyền thông tin bệnh án vừa thêm
            navigate('/newRecord', { state: { record: newRecord, imageUrls } });

            // Reset form
            setNewRecord({
                username: "",
                fullName: "",
                dateOfBirth: "",
                hometown: "",
                occupation: "",
                cccd: "",
                healthInsuranceNumber: "",
                admissionDateTime: "",
                mriOrXrayCIDs: [],
                diagnosis: "",
                medicalHistory: "",
                conclusion: ""
            });
            setFiles([]);
            setImageUrls([]);
        } catch (error) {
            console.error("Lỗi khi thêm hồ sơ:", error);
            alert("Không thể thêm hồ sơ bệnh án.");
        }
    };

    return (

        <div>
            <button onClick={handleBack}>Quay lại</button>
            <h1>Thêm Hồ Sơ Bệnh Án</h1>
            <form onSubmit={handleAddRecord}>
                <input
                    type="text"
                    name="fullName"
                    value={newRecord.fullName}
                    onChange={handleChange}
                    placeholder="Họ tên"
                />
                <input
                    type="text"
                    name="dateOfBirth"
                    value={newRecord.dateOfBirth}
                    onChange={handleChange}
                    placeholder="Ngày tháng năm sinh"
                />
                <input
                    type="text"
                    name="hometown"
                    value={newRecord.hometown}
                    onChange={handleChange}
                    placeholder="Quê quán"
                />
                <input
                    type="text"
                    name="occupation"
                    value={newRecord.occupation}
                    onChange={handleChange}
                    placeholder="Nghề nghiệp"
                />
                <input
                    type="text"
                    name="cccd"
                    value={newRecord.cccd}
                    onChange={handleChange}
                    placeholder="Số CCCD"
                />
                <input
                    type="text"
                    name="healthInsuranceNumber"
                    value={newRecord.healthInsuranceNumber}
                    onChange={handleChange}
                    placeholder="Số bảo hiểm y tế"
                />
                <input
                    type="text"
                    name="admissionDateTime"
                    value={newRecord.admissionDateTime}
                    onChange={handleChange}
                    placeholder="Ngày giờ vào viện"
                />
                <input
                    type="text"
                    name="diagnosis"
                    value={newRecord.diagnosis}
                    onChange={handleChange}
                    placeholder="Chẩn đoán"
                />
                <textarea
                    name="medicalHistory"
                    value={newRecord.medicalHistory}
                    onChange={handleChange}
                    placeholder="Lịch sử y tế"
                />
                <textarea
                    name="conclusion"
                    value={newRecord.conclusion}
                    onChange={handleChange}
                    placeholder="Kết luận"
                />
                <input
                    type="file"
                    multiple
                    onChange={handleFilesChange}
                />
                <button type="button" onClick={handleUploadToPinata}>Tải ảnh lên</button>
                <button type="submit">Thêm hồ sơ</button>
            </form>
            {imageUrls.length > 0 && (
                <div>
                    <p>Ảnh đã tải lên:</p>
                    {imageUrls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Ảnh bệnh án ${index + 1}`}
                            style={{ width: '90%', marginBottom: '10px' }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default AddPatientRecord;
