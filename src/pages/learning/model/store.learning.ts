import { createSlice } from "@reduxjs/toolkit";

const initialState: { sidebar_Status: boolean } = {
	sidebar_Status: false,
};

const learningSlice = createSlice({
	name: "learning",
	initialState,
	reducers: {
		toggleSidebar: (state) => {
			state.sidebar_Status = !state.sidebar_Status;
		},
	},
});

export const { toggleSidebar } = learningSlice.actions;
export default learningSlice.reducer;
