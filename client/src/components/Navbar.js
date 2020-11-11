import React, {useContext, useRef, useEffect, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {UserContext, userContext} from '../App';
import M from 'materialize-css';


const NavBar = () => {

    const searchModal = useRef(null)
    const [search, setSearch] = useState('')
    const [userDetails, setUserDetails] = useState([])
    //the usestate [] inside the () means that it will be an array
    const {state, dispatch} = useContext(UserContext)
    const history = useHistory();

    useEffect(() => {
        M.Modal.init(searchModal.current)
    }, [])

    const renderList = () => {
        if(state) {

            return [
                <ul>
                    <li key="1"><i data-target="modal1" className="large material-icons modal-trigger" style={{color: "black"}}>search</i></li>
                    <li key="2"><Link to="/profile">Profile</Link></li>,
                    <li key="3"><Link to="/create">Create Post</Link></li>,
                    <li key="4"><Link to="/myfollowingpost">My following Posts</Link></li>,
                    <li key="5">
                        
                        <button 
                            className="btn #c62828 red darken-3"
                            onClick={() => {
                                localStorage.clear()
                                dispatch({type: "CLEAR"})
                                history.push('/signin')
                            }}
                        >

                            LOGOUT

                        </button>
                    </li>
                </ul>
            ]

        } else {

            return [
                <ul>

                    <li key="6"><Link to="/signin">Signin</Link></li>,
                    <li key="7" key="1" key="1"><Link to="/signup">Signup</Link></li>
                    
                </ul>
            ]
        }
    }


    const fetchUsers = (query) => {

        setSearch(query)
        fetch('/search-users', {
            method: "post",
            headers: {
                "Content-Type": "application/json"
             },
            body: JSON.stringify ({
                query
            })
        }).then(res => res.json())
        .then(results => {
            setUserDetails(results.user)
            console.log(results)
        })

    }

    return(
        <nav>
            <div className="nav-wrapper white">
                <Link to={state?"/":"/signin"} className="brand-logo left">Instagram</Link>
                <ul id="nav-mobile" className="right">

                    {renderList()}

                </ul>
            </div>


            {/* <!-- Modal Structure --> */}
            <div id="modal1" className="modal" ref={searchModal} style={{color: "black"}}>
                <div className="modal-content">


                    <input 
                        type='text'
                        placeholder="search-users"
                        value={search}
                        onChange={(e) => fetchUsers(e.target.value)}
                    
                    />

                                    
                    <ul className="collection">
                        {
                            userDetails.map(item => {
                                return <Link to={item._id !== state._id ? '/profile/' + item._id : '/profile'} onClick={ ()=> {
                                            M.Modal.getInstance(searchModal.current).close()
                                            setSearch('')
                                        }}>



                                        <li className="collection-item">{item.email}</li>
                                        </Link>
                            })
                        }
                    </ul>


                </div>

                <div className="modal-footer">
                    <button className="modal-close waves-effect waves-green btn-flat" onClick={ () => setSearch('')}>close</button>
                </div>
            </div>
        </nav>
              
    )

}

export default NavBar;