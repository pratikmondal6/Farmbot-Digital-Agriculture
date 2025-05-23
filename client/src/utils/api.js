import axios from "axios"

const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJ1bmtub3duIiwic3ViIjoyODIzOCwiaWF0IjoxNzQ3NjU3MTQ1LCJqdGkiOiJlNjJkZDY0Ni1kM2M3LTRkYWYtYWY1Ny0wNWI3Y2IzNjNmMzkiLCJpc3MiOiIvL215LmZhcm0uYm90OjQ0MyIsImV4cCI6MTc1Mjg0MTE0NSwibXF0dCI6ImNsZXZlci1vY3RvcHVzLnJtcS5jbG91ZGFtcXAuY29tIiwiYm90IjoiZGV2aWNlXzI4MzQ2Iiwidmhvc3QiOiJ4aWNvbmZ1bSIsIm1xdHRfd3MiOiJ3c3M6Ly9jbGV2ZXItb2N0b3B1cy5ybXEuY2xvdWRhbXFwLmNvbTo0NDMvd3MvbXF0dCJ9.d8nUKsUrZ1kEwauv_DndTQXD4De6FOJzlsVw1vA5SwkLl5E7AdEP1oulfzFqfFZRhw_zKhHuMn1ih8HpC5yA2YDmLwHC8UIDkbKuURMKbWG9uPoFIMhyavow-Vb0DaGtSDCObK2my87X2uckOSCKe-usxvtuF6fBkyecjZsNeZ_oIIu6htaTtXe35uDggfITIVBEtoWieRmXE9ueAa1nHGbAh0S1ZNZJkv8-pZ2_e_54Uh8zSiga5QjiYwnC0sdeHdFnyL8Hq102pcALha1MoXvWjz-WGwPRaJUQq_WyLIZcqgtUW20HVJ1IevdB54Nfd2Mp_O_Hi1_SXt4asDnnAg";

const instance = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    },
});

export default instance;