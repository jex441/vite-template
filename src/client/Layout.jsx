import Nav from "./components/Nav";
import { Outlet } from "react-router-dom";

const Layout = () => {
	return (
		<div className="dark:bg-[#131723] bg-[#f9f9f9] min-h-[100vh] items-center">
			<Nav />
			<Outlet />
		</div>
	);
};

export default Layout;
