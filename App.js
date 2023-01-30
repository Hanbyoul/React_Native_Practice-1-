import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator, // Loading Spinner
} from "react-native";
import * as Location from "expo-location";
import { Fontisto } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

const { width: SCREEN_SIZE } = Dimensions.get("window");

const API_KEY = "860f2b4d1ecfc1b95b8bab0cad99bd91";

const icons = {
  // 아이콘 라이브러리 와 day.weather[0].main 값을 매칭 시켜서 아이콘을 불러온다
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snowflake-6",
  Rain: "rain",
  Drizzle: "cloud-drizzle",
  Thunderstorm: "thunderstorm-outline",
};

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const getWeather = async () => {
    //위치정보 권한 확인
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    // 🔥 CODE Challenge (1)  ok boolean 에 따른 상태 UI 만들기 (유저가 권한을 허가 하지 않았을 경우)

    //권한 확인후 유저의 위도와 경도를 추출
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 }); // 현재 위치 추출

    //유저의 지역을 추출.
    //reverseGeocodeAsync : 위도와 경도를 주소로 변환해줌.
    //GeocodeAsync: 주소를 위도, 경도 숫자로 변환해줌.
    const location = await Location.reverseGeocodeAsync(
      {
        latitude,
        longitude,
      },
      { useGoogleMaps: false }
    );
    setCity(location[0].city); // 유저의 지역

    const response = await fetch(
      //Weather API 3시간 단위
      `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();
    setDays(json.list);
  };
  useEffect(() => {
    getWeather(); // component mount  fn호출
  }, []);

  return (
    <View style={styles.container}>
      {ok ? (
        <>
          <View style={styles.city}>
            <Text style={styles.cityName}>{city}</Text>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weather}
          >
            {days.length === 0 ? (
              <View style={styles.loading}>
                <ActivityIndicator
                  color={"grey"}
                  size="large"
                  style={{ marginTop: 10 }}
                />
              </View>
            ) : (
              days.map((day, index) => (
                <View key={index} style={styles.day}>
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.temp}>
                      {parseFloat(day.main.temp).toFixed(1)}℃
                    </Text>
                    <Fontisto
                      name={icons[day.weather[0].main]}
                      size={64}
                      color="white"
                    />
                  </View>

                  <Text style={styles.description}>{day.weather[0].main}</Text>
                  <Text style={styles.tinyText}>
                    {day.weather[0].description}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </>
      ) : (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <FontAwesome5 name="user-times" size={148} color="black" />
          <Text style={{ marginTop: 50, fontSize: 16, fontWeight: "600" }}>
            위치 권한을 거부하여, 위치를 찾을수가 없습니다.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "orange",
  },
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 62,
    fontWeight: "600",
    color: "white",
  },
  weather: {},
  day: {
    width: SCREEN_SIZE,
    alignItems: "flex-start",
    padding: 15,
  },
  loading: {
    width: SCREEN_SIZE,
    alignItems: "center",
  },
  temp: {
    marginTop: 50,
    fontSize: 90,
    color: "white",
  },
  description: {
    fontSize: 48,
    marginTop: -15,
    color: "white",
  },
  tinyText: {
    marginTop: -10,
    fontSize: 16,
    marginLeft: 5,
    color: "white",
  },
});
