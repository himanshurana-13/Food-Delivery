import React, { useContext, useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios"

const Verify = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const success = searchParams.get("success")
    const orderId = searchParams.get("orderId")
    const { url } = useContext(StoreContext);
    const navigate = useNavigate()

    const verifyPayment = async () => {
        try {
            const response = await axios.post(`${url}/api/order/verify-order`, {
                orderId,
                success: success === 'true'
            });
            
            if (response.data.success) {
                navigate("/myorders");
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error('Verification error:', error);
            navigate("/");
        }
    }

    useEffect(() => {
        if (orderId && success !== null) {
            verifyPayment();
        } else {
            navigate("/");
        }
    }, [orderId, success]);

    return (
        <div>
            <div className='verify'>
                <div className="spinner"></div>
            </div>
        </div>
    )
}

export default Verify
