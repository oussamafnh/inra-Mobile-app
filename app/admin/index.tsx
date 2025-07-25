import React, { useState, useEffect } from 'react';
import { BackHandler, TouchableWithoutFeedback, Image } from 'react-native';
import { Div, Text, Button, Modal } from 'react-native-magnus';
import { useRouter } from 'expo-router';
import { saveItem, getItem, deleteItem } from '../utils/authToken';

export default function AdminIndex() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const router = useRouter();
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const backAction = () => {
      if (!modalVisible) {
        setModal2Visible(true);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
    };
  }, [modalVisible]);

  const handleCloseApp = () => {
    BackHandler.exitApp();
  };

  const handleLogout = async () => {
    try {

      await deleteItem('authToken');
      await deleteItem('id');
      await deleteItem('fullName');

      router.push('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Div flex={1} bg="white" justifyContent="center" alignItems="center">
      {}
      <Image
        source={require('../../assets/images/cc.png')}
        style={{ width: "100%", height: 100, marginBottom: 20 }}
        resizeMode="contain"
      />
      <Div alignItems="center" mb="100" mt="0">
        <Text fontSize="lg" fontWeight="bold" color="black" mb="sm">
          {currentDate}
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color="black" mb="lg"> {}
          Bonjour
        </Text>
      </Div>

      {}
      <Div alignItems="center" w="90%" mb="xl">
        <Button
          w="100%"
          bg="green500"
          color="white"
          fontWeight="bold"
          mb="md"
          onPress={() => router.push('/admin/listprojets')}
        >
          Projets
        </Button>
        <Button
          w="100%"
          bg="green500"
          color="white"
          fontWeight="bold"
          mb="md"
          onPress={() => router.push('/admin/listchercheur')}
        >
          Chercheurs
        </Button>
        <Button
          w="100%"
          bg="orange500"
          color="white"
          fontWeight="bold"
          mb="md"
          onPress={() => router.push('/admin/listrapports')}
        >
          Rapports
        </Button>
      </Div>

      {}
      <Button
        position="absolute"
        bottom={20}
        alignSelf="center"
        bg="red500"
        color="white"
        fontWeight="bold"
        w="90%"
        onPress={() => setModalVisible(true)}
      >
        Déconnexion
      </Button>

      {
        modalVisible && (
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
            <Div
              p="xl"
              rounded="md"
              bg="white"
              position="absolute"
              bottom={0}
              w="100%"
              zIndex={1000}
            >
              <Div flex={1} justifyContent="center" alignItems="center" p="xl">
                <Text fontSize="lg" mb="lg" fontWeight="bold">
                  Êtes-vous sûr ?
                </Text>
                <Text mb="xl" textAlign="center">
                  Voulez-vous vraiment vous déconnecter ?
                </Text>
                <Div row justifyContent="center" w="100%" p="md">
                  <Button bg="red600" onPress={() => setModalVisible(false)} w={120} mr="lg">
                    <Text color="white">Non</Text>
                  </Button>
                  <Button bg="green600" onPress={handleLogout} w={120}>
                    <Text color="white">Oui</Text>
                  </Button>
                </Div>
              </Div>
            </Div>
          </>
        )
      }
      {
        modal2Visible && (
          <>
            <TouchableWithoutFeedback onPress={() => setModal2Visible(false)}>
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
            <Div
              p="xl"
              rounded="md"
              bg="white"
              position="absolute"
              bottom={0}
              w="100%"
              zIndex={1000}
            >
              <Div flex={1} justifyContent="center" alignItems="center" p="xl">
                <Text fontSize="lg" mb="lg" fontWeight="bold">
                  Êtes-vous sûr ?
                </Text>
                <Text mb="xl" textAlign="center">
                  Voulez-vous vraiment quitter l'application ?
                </Text>
                <Div row justifyContent="center" w="100%" p="md">
                  <Button bg="red600" onPress={() => setModal2Visible(false)} w={120} mr="lg">
                    <Text color="white">Non</Text>
                  </Button>
                  <Button bg="green600" onPress={handleCloseApp} w={120}>
                    <Text color="white">Oui</Text>
                  </Button>
                </Div>

              </Div>
            </Div>
          </>
        )
      }
    </Div>
  );
}
