import * as React from "react";
import { useState, useContext, useEffect } from "react";
import {
    Text,
    StyleSheet,
    View,
    Image,
    ScrollView,
    Pressable,
    TextInput,
    SafeAreaView,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { baseUrl } from "../../services/api";
import { AuthContext } from "../../context/authContext";

const SignUp = () => {
    const navigation = useNavigation();
    const { userInfo, signup } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!navigation.canGoBack() && userInfo != null) {
            navigation.navigate("Home");
        }
    }, [navigation, userInfo]);

    const handleSignUp = async () => {
        if (!username || !email || !password || !name) {
            return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin đăng ký.");
        }

        setIsLoading(true);
        try {
            const success = await signup(username, email, password, name);
            if (success) {
                navigation.navigate("SignIn");
            }
        } catch (e) {
            console.log(`sign up error in component: ${e}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#BE0303', '#1c1a1a', '#000000']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <SafeAreaView style={styles.logoContainer}>
                    <Image
                        style={styles.logo}
                        resizeMode="contain"
                        source={require("../../assets/logo.png")}
                    />
                    <Text style={styles.appName}>English Social Network</Text>
                </SafeAreaView>

                <View style={styles.content}>
                    {/* <Text style={styles.title}>Hãy bắt đầu!</Text> */}
                    <Text style={styles.subText}>Tạo tài khoản mới để tạo bài viết về tiếng anh, bình luận và chia sẻ với bạn bè.</Text>

                    <View style={styles.inputWrapper}>
                        <Image style={styles.icon} source={require("../../assets/group-191.png")} />
                        <TextInput
                            placeholder="Tên người dùng"
                            value={username}
                            onChangeText={setUsername}
                            placeholderTextColor="#ccc"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Image style={styles.icon} source={require("../../assets/group-191.png")} />
                        <TextInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholderTextColor="#ccc"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Image style={styles.icon} source={require("../../assets/group-191.png")} />
                        <TextInput
                            placeholder="Họ tên"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#ccc"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Image style={styles.icon} source={require("../../assets/group-201.png")} />
                        <TextInput
                            placeholder="Mật khẩu"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#ccc"
                            style={styles.input}
                            autoCapitalize="none"
                        />
                    </View>

                    <Pressable 
                        onPress={handleSignUp} 
                        style={[styles.signUpButton, isLoading && styles.disabledButton]}
                        disabled={isLoading}
                    >
                        <Text style={styles.signUpText}>
                            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                        </Text>
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Đã có tài khoản?</Text>
                        <Pressable onPress={() => navigation.navigate("SignIn")}>
                            <Text style={styles.signInText}> Đăng nhập</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    logo: {
        width: 80,
        height: 67,
    },
    appName: {
        fontSize: 20,
        color: "#fff",
        marginTop: 12,
        fontWeight: "bold",
        fontFamily: "PlayfairDisplay-Bold",
    },
    content: {
        gap: 20,
    },
    title: {
        fontSize: 22,
        fontFamily: "PlayfairDisplay-Bold",
        color: "#fff",
    },
    subText: {
        fontSize: 16,
        color: "#eee",
        fontFamily: "PlayfairDisplay-Regular",
        textAlign: "center",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#333",
        padding: 8,
        borderRadius: 12,
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    input: {
        color: "white",
        flex: 1,
        fontSize: 16,
        fontFamily: "PlayfairDisplay-Regular",
    },
    signUpButton: {
        backgroundColor: "#BE0303",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: "#666",
        opacity: 0.7,
    },
    signUpText: {
        color: "white",
        fontFamily: "PlayfairDisplay-Bold",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 12,
    },
    footerText: {
        color: "#ccc",
        fontFamily: "PlayfairDisplay-Regular",
    },
    signInText: {
        color: "#fff",
        fontFamily: "PlayfairDisplay-Bold",
    },
});

export default SignUp;
