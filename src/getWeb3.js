import Web3 from 'web3';

const getWeb3 = () =>
    new Promise(async (resolve, reject) => {
        try {
            if (window.ethereum) {
                // Nếu MetaMask có sẵn
                const web3 = new Web3(window.ethereum);
                try {
                    // Yêu cầu quyền truy cập tài khoản MetaMask
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    console.log("MetaMask đã được kết nối.");
                    resolve(web3);
                } catch (error) {
                    console.error("Lỗi khi yêu cầu quyền truy cập MetaMask:", error);
                    reject(new Error('Không thể yêu cầu quyền truy cập tài khoản MetaMask. Vui lòng kiểm tra cấu hình MetaMask.'));
                }
            } else if (window.web3) {
                // Trình duyệt Dapp cũ có Web3
                const web3 = new Web3(window.web3.currentProvider);
                console.log("Sử dụng Web3 hiện có từ trình duyệt Dapp cũ.");
                resolve(web3);
            } else {
                // Nếu không có MetaMask, sử dụng provider của Ganache (localhost)
                const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545'); // Ganache URL
                const web3 = new Web3(provider);
                console.log("Không tìm thấy MetaMask, kết nối với Ganache.");
                resolve(web3);
            }
        } catch (error) {
            console.error("Lỗi khi khởi tạo Web3:", error);
            reject(new Error('Không thể khởi tạo Web3. Vui lòng kiểm tra cấu hình trình duyệt hoặc mạng.'));
        }
    });

export default getWeb3;
