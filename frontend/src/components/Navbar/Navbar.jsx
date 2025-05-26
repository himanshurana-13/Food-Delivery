import React, { useContext, useState, useRef } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import {Link, useNavigate} from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'

const Navbar = ({setShowLogin, onSearch}) => {
    const [menu,setMenu] = useState("home");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const searchContainerRef = useRef(null);

    const{getTotalCartAmount,token,setToken} = useContext(StoreContext);
    const navigate = useNavigate();
    
    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        navigate("/")
    }

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch(query);
    }

    return (
        <div className='navbar'>
          <Link to='/'><img src={assets.logo} alt="" className="logo" /></Link> 
            <ul className='navbar-menu'>
                <Link to='/' onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>home</Link>
                <a href='#explore-menu' onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>menu</a>
                <a href='#app-download' onClick={()=>setMenu("mobile-app")} className={menu==="mobile-app"?"active":""}>mobile-app</a>
                <a href='#footer' onClick={()=>setMenu("contact-us")} className={menu==="contact-us"?"active":""}>contact us</a>
            </ul>

            <div className="navbar-right">
                <div
                  className="search-container"
                  tabIndex={-1}
                  ref={searchContainerRef}
                  onBlur={(e) => {
                    if (!searchContainerRef.current.contains(e.relatedTarget)) {
                      setShowSearch(false);
                    }
                  }}
                  style={{ position: "relative" }}
                >
                  {showSearch && (
                    <input
                      type="text"
                      placeholder="Search food..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="search-input"
                      autoFocus
                      onFocus={() => setShowSearch(true)}
                    />
                  )}
                  <img
                    src={assets.search_icon}
                    alt=""
                    className="search-icon"
                    tabIndex={0}
                    onMouseDown={e => {
                      e.preventDefault();
                      setShowSearch(s => !s);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <div className='navbar-search-icon'>
                   <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link> 
                    <div className={getTotalCartAmount()===0?"":"dot"}></div>
                </div>
                {!token?<button onClick={()=>setShowLogin(true)}>sign in</button>
                :<div className='navbar-profile'>
                    <img src={assets.profile_icon} alt="" />
                    <ul className='navbar-profile-dropdown'>
                        <li onClick={()=>navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
                        <hr />
                        <li onClick={logout}> <img src={assets.logout_icon} alt="" /><p>Logout</p></li>
                    </ul>
                </div>}
            </div>
        </div>
    )
}

export default Navbar
