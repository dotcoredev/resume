import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from "../layouts/main";
import ResumePage from "../../pages/resume";

export const RouterProvider = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/resume" element={<MainLayout />}>
					<Route index element={<ResumePage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};
