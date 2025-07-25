import React from 'react';
import { useRouter } from 'expo-router';
import { Div, Button, Header, Icon } from 'react-native-magnus';

const ListRapports = () => {
  const router = useRouter();

  return (
    <Div flex={1} bg="white">
      {}
      <Header
        p="lg"
        borderBottomWidth={1}
        borderBottomColor="gray200"
        alignment="center"
        bg="white"
        prefix={
          <Button bg="transparent" onPress={() => router.back()}>
            <Icon name="arrow-left" fontFamily="Feather" fontSize="2xl" />
          </Button>
        }
      >
        Liste des Rapports
      </Header>

      {}
      <Div flex={1} justifyContent="center" alignItems="center" px="lg">
        <Button
          block
          bg="green500"
          color="white"
          fontWeight="bold"
          mb="lg"
          onPress={() => router.push(`/admin/rapportgeneral`)}
          >
          Rapport Generale
        </Button>
        <Button
          block
          bg="green500"
          color="white"
          fontWeight="bold"
          mb="lg"
          onPress={() => router.push('/admin/selectchercheur')}
        >
          Rapport Par Chercheur
        </Button>

      </Div>
    </Div>
  );
};

export default ListRapports;
