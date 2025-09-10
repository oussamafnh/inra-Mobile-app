import React, { useState, useEffect } from 'react';
import { BackHandler, TouchableWithoutFeedback, Image } from 'react-native';
import { Div, Text, Button, Input, Icon } from 'react-native-magnus';
import { useRouter } from 'expo-router';
import { saveItem, getItem, deleteItem } from '../utils/authToken';
import axios from 'axios';

export default function Login() {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  useEffect(() => {
    const backAction = () => {
      if (!modalVisible) {
        setModalVisible(true);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [modalVisible]);

  const handleLogin = async () => {
    if (!fullName || !password) {
      setErrorMessage('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users/login`, {
        fullName,
        password,
      });

      const { authToken, role, message, status, id } = response.data;

      if (status === 'nonloged') {
        setErrorMessage(message);
      } else {
        await saveItem('authToken', authToken);
        setErrorMessage('');

        if (role === 'chercheur') {
          await saveItem('fullName', fullName);
          await saveItem('id', id);
          router.push('/chercheur');
        } else if (role === 'admin') {
          router.push('/admin');
        }
      }
    } catch (error) {
      console.error(error);
      setLoading(false);

      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
        setErrorMessage('Échec de la connexion');
      } else {
        setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter, value) => {
    setter(value);
    if (errorMessage) setErrorMessage('');
  };

  const handleCloseApp = () => {
    BackHandler.exitApp();
  };

  return (
    <Div flex={1} justifyContent="center" bg="white" alignItems="center" p="lg" style={{ position: 'relative' }}>
      <Div w="100%">
        <Image
          source={require('../../assets/images/cc.png')}
          style={{ width: '100%', height: 200, marginBottom: 20 }}
          resizeMode="contain"
        />
        <Text fontSize="4xl" fontWeight="bold" color="green500" mb="xl" textAlign="center">
          Bienvenue !
        </Text>
        <Input
          placeholder="Nom complet"
          value={fullName}
          onChangeText={(text) => handleInputChange(setFullName, text)}
          focusBorderColor="green500"
          borderColor="gray300"
          p="lg"
          mb="lg"
          rounded="md"
          w="100%"
        />
        <Input
          placeholder="Mot de passe"
          value={password}
          secureTextEntry={!isPasswordVisible}
          onChangeText={(text) => handleInputChange(setPassword, text)}
          focusBorderColor="green500"
          borderColor="gray300"
          p="lg"
          mb="xl"
          rounded="md"
          w="100%"
          suffix={
            <Button
              bg="transparent"
              onPress={togglePasswordVisibility}
              px="none"
              py="none"
              w={40}
              justifyContent="center"
              alignItems="center"
            >
              <Icon
                name={isPasswordVisible ? 'eye' : 'eye-off'}
                fontFamily="Feather"
                fontSize="xl"
                color="gray600"
              />
            </Button>
          }
        />
        <Button
          block
          bg={errorMessage ? 'red600' : 'green500'}
          color="white"
          fontWeight="bold"
          fontSize="lg"
          onPress={handleLogin}
          loading={loading}
          loaderColor="white"
          disabled={loading}
        >
          {loading ? 'Connexion en cours...' : errorMessage || 'Connexion'}
        </Button>
      </Div>

      {}
      <Div position="absolute" bottom={20} alignSelf="center">
        <Text fontSize="sm" color="green500">
          {process.env.EXPO_PUBLIC_VERSION}
        </Text>
      </Div>

      {modalVisible && (
        <>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <Div
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="black"
              opacity={0.7}
              zIndex={999}
            />
          </TouchableWithoutFeedback>
          <Div p="xl" rounded="md" bg="white" position="absolute" bottom={0} w="100%" zIndex={1000}>
            <Div flex={1} justifyContent="center" alignItems="center" p="xl">
              <Text fontSize="lg" mb="lg" fontWeight="bold">
                Êtes-vous sûr ?
              </Text>
              <Text mb="xl" textAlign="center">
                Voulez-vous vraiment quitter l'application ?
              </Text>
              <Div row justifyContent="center" w="100%" p="md">
                <Button bg="red600" onPress={() => setModalVisible(false)} w={120} mr="lg">
                  <Text color="white">Non</Text>
                </Button>
                <Button bg="green600" onPress={handleCloseApp} w={120}>
                  <Text color="white">Oui</Text>
                </Button>
              </Div>
            </Div>
          </Div>
        </>
      )}
    </Div>
  );
}