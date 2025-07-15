import { BrowserRouter, Route, Routes } from "react-router";
import { MainLayout } from "../layouts/main";
import ResumePage from "../../pages/resume";
import HomePage from "../../pages/home";
import { ResumeLayout } from "../layouts/main";
import DesignTemplatePage from "../../pages/learning";
import TodoPage from "../../pages/todo";
import { AppProviders } from "../providers";

export const RouterProvider = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<MainLayout />}>
					<Route index element={<HomePage />} />
					<Route path="/learning" element={<DesignTemplatePage />} />
					<Route
						path="/chat"
						element={
							<AppProviders
								namespace="/todos"
								autoConnect={false}
							>
								<TodoPage />
							</AppProviders>
						}
					/>
				</Route>
				<Route path="/resume" element={<ResumeLayout />}>
					<Route index element={<ResumePage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};
