import { useState, useEffect } from 'react';  
import Button from '@mui/material/Button';  
import TextField from '@mui/material/TextField';  
import { ethers } from 'ethers';  

function App() {  
  const [erc20Address, setErc20Address] = useState('');  
  const [ethBalance, setEthBalance] = useState('');  
  const [erc20Balance, setErc20Balance] = useState('');  
  const [loading, setLoading] = useState(false);  // 添加 loading 状态
  useEffect(() => {
    // 检查是否存在window.ethereum
    if (typeof window.ethereum !== 'undefined') {
      // 初始化MetaMask或请求连接
      // 这里你可以请求授权连接，例如：
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          console.log('已连接到MetaMask，地址：', accounts[0]);
        })
        .catch((error) => {
          console.error('连接到MetaMask时出错：', error);
        });
    }
  }, []);
  // 检查是否已连接 MetaMask 钱包
  const isConnectedToMetaMask = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  };

  // 获取 ETH 余额
  const getEthBalance = async () => {  
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {  
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);  
        const signer = provider.getSigner();  
        const address = await signer.getAddress();  
        const balance = await provider.getBalance(address);  
        return ethers.utils.formatEther(balance);  
      } catch (error) {
        console.error("获取 ETH 余额时出错：", error);
        return null;
      }
    } else {  
      console.log("MetaMask 未连接或未正确配置");  
      return null;  
    }
  }  
    
  // 获取 ERC20 余额
  const getErc20Balance = async (erc20Address) => {  
    if (isConnectedToMetaMask()) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(erc20Address, ['function balanceOf(address) returns (uint256)'], signer);
      console.log(contract);
      const balance = await contract.balanceOf(address);
      console.log(balance);
      // 检查是否有效的 BigNumber 对象
      if (ethers.BigNumber.isBigNumber(balance.value)) {
        return ethers.utils.formatUnits(balance.value, 18); // 假设 ERC20 的小数位为 18
      } else {
        // 处理无效的余额值，例如返回一个默认值或抛出错误
        console.error("无效的代币余额值");
        return null;
      }
    } else {
      console.error("MetaMask 未连接或未正确配置");
      return null;
    }
  }

  const handleQueryBalance = async () => {  
    setLoading(true);  // 设置 loading 状态
    try {  
      const eth = await getEthBalance();  
      setEthBalance(eth);  
  
      if (erc20Address) {  
        const erc20 = await getErc20Balance(erc20Address);  

        setErc20Balance(erc20);  
      }  
    } catch (error) {  
      console.error("查询余额失败：", error);  
    } finally {
      setLoading(false);  // 取消 loading 状态
    }
  };  

  useEffect(() => {
    // 如果用户已连接 MetaMask 钱包，初始化 ETH 余额
    if (isConnectedToMetaMask()) {
      getEthBalance()
        .then(balance => setEthBalance(balance))
        .catch(error => console.error("无法获取 ETH 余额：", error));
    }
  }, []);

  return (  
    <>  
      <div>   
        <TextField  
          label="ERC20 合约地址"  
          value={erc20Address}  
          onChange={(e) => setErc20Address(e.target.value)}  
        />  
        <Button variant="contained" color="primary" onClick={handleQueryBalance}>  
          查询余额  
        </Button>  
        {loading && <div>查询中...</div>}  {/* 显示 loading 状态 */}
        {!loading && (
          <>
            <div>  
              ETH 余额：{ethBalance} ETH  
            </div>  
            <div>  
              ERC20 余额：{erc20Balance}  
            </div>  
          </>
        )}
      </div>  
    </>  
  );  
}

export default App;