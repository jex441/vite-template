import { useQuery } from "@tanstack/react-query";
import {
	createBrowserRouter,
	RouterProvider,
	useRouteError,
} from "react-router-dom";
import axios from "axios";
import { useStore } from "./store";
import { React } from "react";

import Profile from "./components/Profile.jsx";
import Login from "./components/Login.jsx";
import Layout from "./Layout.jsx";

function App() {
	const { user, setUserInfo } = useStore();

	const getUser = async () => {
		try {
			const { data } = await axios.get("/api/auth/me").then((res) => {
				console.log(res);
				return res;
			});
			console.log(data);
			return data;
		} catch (error) {
			console.log(error);
		}
	};

	const { data, isFetching: loading } = useQuery({
		queryKey: ["userinfo"],
		queryFn: getUser,
		enabled: !user.isLoggedIn,
	});

	if (data?.isLoggedIn && !user.isLoggedIn) {
		setUserInfo(data);
		localStorage.setItem("user", JSON.stringify(data));
	}

	const router = createBrowserRouter([
		{
			path: "/",
			element: <Layout />,
			children: !user.isLoggedIn
				? [
						{
							index: true,
							element: <Login loading={loading} />,
							errorElement: <ErrorBoundary />,
						},
				  ]
				: [
						{
							path: "/",
							element: <Profile />,
							errorElement: <ErrorBoundary />,
						},
				  ],
		},
	]);

	function ErrorBoundary() {
		let error = useRouteError();
		return (
			<div className="w-full h-full items-center justify-center px-4 py-2 shadow-md rounded-lg text-sm flex flex-col bg-white/90 dark:bg-[#202530] border border-transparent border-1 dark:border-[#373D47]">
				Dang - there was an error. Please return to{" "}
				<a className="underline" href="/">
					home.
				</a>
			</div>
		);
	}

	if (loading) {
		return "loading";
	}

	return <RouterProvider router={router} />;
}

export default App;
