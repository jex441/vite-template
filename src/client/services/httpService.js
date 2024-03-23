import apiClient from "./apiClient";

class HttpService {
	getUser = async ({ queryKey }) => {
		const [_, userID] = queryKey;
		try {
			const { data } = await apiClient
				.get(`/users/${userID}`)
				.then(({ data }) => data);
			return data;
		} catch (error) {
			console.log(error);
			return error;
		}
	};
}

const httpService = () => new HttpService();

export default httpService;
