export const handleApiCall = async (apiCall, onSuccess, errorMessage) => {
  try {
    const response = await apiCall();
    if (!response.ok) throw new Error(errorMessage);
    const data = await response.json();
    await onSuccess(data);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};