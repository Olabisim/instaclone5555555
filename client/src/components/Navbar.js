import React, {useContext} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {UserContext, userContext} from '../App'


const NavBar = () => {

    const {state, dispatch} = useContext(UserContext)
    const history = useHistory();
    const renderList = () => {
        if(state) {

            return [
                <ul>k
                    <li><Link to="/profile">Profile</Link></li>,
                    <li><Link to="/create">Create Post</Link></li>,
                    <li><Link to="/myfollowingpost">My following Posts</Link></li>,
                    <li>
                        
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

                    <li><Link to="/signin">Signin</Link></li>,
                    <li><Link to="/signup">Signup</Link></li>
                    
                </ul>
            ]
        }
    }

    return(
        <nav>
            <div className="nav-wrapper white">
                <Link to={state?"/":"/signin"} className="brand-logo left">Instagram</Link>
                <ul id="nav-mobile" className="right">

                    {renderList()}

                </ul>
            </div>
        </nav>
              
    )

}

export default NavBar;