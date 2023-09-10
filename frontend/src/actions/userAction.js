import axios from "axios";
import{
    ALL_USERS_FAIL,
    ALL_USERS_REQUEST,
    ALL_USERS_SUCCESS,
    CLEAR_ERRORS
} from "../constants/userConstants";

export const getUsers = () => async (dispatch) => {
    try {
        dispatch({
            type: ALL_USERS_REQUEST
        });

        const {data} = await axios.get("/api/users");

        dispatch({
            type: ALL_USERS_SUCCESS,
            payload: data
        });

    } catch (error) {
        dispatch ({
            type: ALL_USERS_FAIL,
            payload: error.response.data.message
        });
    }
}

export const clearErrors = () => async(dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}