import { createContext, useContext, useReducer } from "react";

const PostContext = createContext();

const initialState = {
  posts: [],
};

function postReducer(state, action) {
  switch (action.type) {
    case "ADD_POST":
      return { ...state, posts: [...state.posts, action.payload] };
    case "SET_POSTS":
      return { ...state, posts: action.payload };
    default:
      return state;
  }
}

export function PostProvider({ children }) {
  const [state, dispatch] = useReducer(postReducer, initialState);

  return (
    <PostContext.Provider value={{ state, dispatch }}>
      {children}
    </PostContext.Provider>
  );
}

export const usePostContext = () => useContext(PostContext);
