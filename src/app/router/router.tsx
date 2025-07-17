import { BrowserRouter, Route, Routes } from "react-router";
import { MainLayout } from "../layouts/main";
import ResumePage from "../../pages/resume";
import HomePage from "../../pages/home";
import { ResumeLayout } from "../layouts/main";
import LearningPage from "../../pages/learning";
import TodoPage from "../../pages/todo";
import { AppProviders } from "../providers";
import { HelmetProvider } from "react-helmet-async";
import { StoreProvider } from "../providers/store.provider";

export const RouterProvider = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<MainLayout />}>
					<Route
						index
						element={
							<HelmetProvider>
								<HomePage />
							</HelmetProvider>
						}
					/>
					<Route
						path="/learning"
						element={
							<StoreProvider>
								<HelmetProvider>
									<LearningPage />
								</HelmetProvider>
							</StoreProvider>
						}
					/>
					<Route
						path="/chat"
						element={
							<HelmetProvider>
								<AppProviders
									namespace="/todos"
									autoConnect={true}
								>
									<TodoPage />
								</AppProviders>
							</HelmetProvider>
						}
					/>
				</Route>
				<Route path="/resume" element={<ResumeLayout />}>
					<Route
						index
						element={
							<HelmetProvider>
								<ResumePage />
							</HelmetProvider>
						}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
};
