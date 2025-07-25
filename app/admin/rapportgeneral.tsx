import React, { useState, useEffect } from 'react';
import { TextInput, ActivityIndicator, Platform, Alert } from 'react-native';
import { Header, Button, Icon, Radio, Text, Div } from 'react-native-magnus';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { Buffer } from 'buffer';
import { getItem } from '../utils/authToken';

const RapportGeneral = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('month');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPermissionRequestActive, setIsPermissionRequestActive] = useState(false);
  const [codeCentres, setCodeCentres] = useState([]);
  const [selectedCodeCentres, setSelectedCodeCentres] = useState(['all']);

  useEffect(() => {
    const fetchCodeCentres = async () => {
      try {
        const storedToken = await getItem('authToken');
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/users/codeCentres`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setCodeCentres(response.data.codeCentres || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des codeCentres:', error);
      }
    };
    fetchCodeCentres();
  }, []);

  const validateInput = (input) => {
    const yearRegex = /^\d{4}$/;
    const monthYearRegex = /^\d{4}-\d{2}$/;
    if (selectedOption === 'month') {
      return monthYearRegex.test(input);
    }
    return yearRegex.test(input);
  };

  const generateFileName = () => {
    const formattedDate = selectedOption === 'month' ? inputValue.replace('-', '_') : inputValue;
    let fileName = `recap_general_${selectedOption === 'month' ? 'mensuel' : 'annuel'}_${formattedDate}`;
    if (selectedCodeCentres.length > 0 && !selectedCodeCentres.includes('all')) {
      fileName += `_centres_${selectedCodeCentres.join('-')}`;
    }
    return `${fileName}.xlsx`;
  };

  const handleExport = async () => {
    try {
      const storedToken = await getItem('authToken');
      if (!storedToken) {
        setError('Utilisateur non authentifié. Veuillez vous reconnecter.');
        router.push('/auth');
        return;
      }

      if (!validateInput(inputValue)) {
        setError('Le format de la date est invalide. Veuillez entrer un format valide (YYYY ou YYYY-MM).');
        return;
      }

      let endpoint = '';
      let codeCentresQuery = selectedCodeCentres.includes('all') ? '' : selectedCodeCentres.join(',');

      if (selectedOption === 'month') {
        const [year, month] = inputValue.split('-');
        if (year && month) {
          endpoint = `/monthlygeneral/${year}-${month}`;
        }
      } else if (selectedOption === 'year') {
        const year = inputValue;
        if (year) {
          endpoint = `/yearlygeneral/${year}`;
        }
      }

      if (!endpoint) {
        setError('Veuillez entrer une valeur valide pour l\'année ou le mois.');
        return;
      }

      if (codeCentresQuery) {
        endpoint += `/${codeCentresQuery}`;
      }

      setLoading(true);
      setError('');

      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/exports${endpoint}`, {
        responseType: 'arraybuffer',
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (response.status !== 200) {
        throw new Error('Erreur lors de l\'exportation.');
      }

      const filename = generateFileName();
      await saveToDevice(response.data, filename);
    } catch (err) {
      console.error('Erreur lors de l\'exportation:', err);
      setError('Une erreur s\'est produite lors de l\'exportation du fichier.');
    } finally {
      setLoading(false);
    }
  };

  const saveToDevice = async (binaryData, filename) => {
    try {
      if (Platform.OS === 'web') {
        const blob = new Blob([binaryData], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        Alert.alert('Succès', `Fichier "${filename}" téléchargé.`);
      } else {
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        const base64 = Buffer.from(binaryData).toString('base64');
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (Platform.OS === 'android') {
          if (isPermissionRequestActive) {
            Alert.alert('En cours', 'Une demande de permission est déjà en cours. Veuillez la compléter.');
            return;
          }

          setIsPermissionRequestActive(true);
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const base64 = await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              filename,
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            await FileSystem.writeAsStringAsync(newFileUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            Alert.alert('Succès', `Fichier "${filename}" a été enregistré.`);
          } else {
            Alert.alert('Permission refusée', 'Impossible de sauvegarder le fichier. Veuillez accorder les permissions.');
          }
        } else if (Platform.OS === 'ios') {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              dialogTitle: `Partager ${filename}`,
            });
          } else {
            Alert.alert('Non supporté', 'Le partage de fichiers n\'est pas disponible sur cette plateforme.');
          }
        } else {
          Alert.alert('Non supporté', 'La sauvegarde directe n\'est pas prise en charge sur cette plateforme.');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde ou du partage:', error);
      Alert.alert('Erreur', `Erreur lors de la sauvegarde ou du partage : ${error.message}`);
    } finally {
      setIsPermissionRequestActive(false);
    }
  };

  const handleToutChange = () => {
    if (selectedCodeCentres.includes('all')) {
      setSelectedCodeCentres([]);
    } else {
      setSelectedCodeCentres(['all']);
    }
  };

  const handleCodeCentreChange = (codeCentre) => {
    if (selectedCodeCentres.includes(codeCentre)) {
      setSelectedCodeCentres(selectedCodeCentres.filter((c) => c !== codeCentre));
    } else {
      setSelectedCodeCentres([...selectedCodeCentres, codeCentre]);
    }
  };

  useEffect(() => {
    if (selectedCodeCentres.length === 0) {
      setSelectedCodeCentres(['all']);
    } else if (selectedCodeCentres.includes('all') && selectedCodeCentres.length > 1) {
      setSelectedCodeCentres(selectedCodeCentres.filter((c) => c !== 'all'));
    }
  }, [selectedCodeCentres]);

  return (
    <Div flex={1} bg="white">
      <Header
        p="lg"
        borderBottomWidth={1}
        borderBottomColor="gray200"
        alignment="center"
        bg="white"
        prefix={
          <Button bg="transparent" onPress={() => router.back()} disabled={loading}>
            <Icon name="arrow-left" fontFamily="Feather" fontSize="2xl" />
          </Button>
        }
      >
        <Text fontSize="xl" fontWeight="bold">
          Rapports Generale
        </Text>
      </Header>
      <Div p="lg">
        <Text fontWeight="bold" fontSize="lg" mb="md">
          Choisir une option:
        </Text>
        <Div row>
          <Radio
            checked={selectedOption === 'month'}
            onChange={() => {
              setSelectedOption('month');
              setInputValue('');
            }}
          >
            <Text>Mensuel</Text>
          </Radio>
          <Radio
            ml="lg"
            checked={selectedOption === 'year'}
            onChange={() => {
              setSelectedOption('year');
              setInputValue('');
            }}
          >
            <Text>Annuel</Text>
          </Radio>
        </Div>
      </Div>
      <Div p="lg">
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: 'gray',
            padding: 10,
            borderRadius: 5,
            fontSize: 16,
          }}
          placeholder={selectedOption === 'month' ? 'YYYY-MM' : 'YYYY'}
          value={inputValue}
          onChangeText={setInputValue}
          editable={!loading}
        />
        {error && (
          <Text color="red600" mt="md" fontSize="sm">
            {error}
          </Text>
        )}
      </Div>
      <Div p="lg">
        <Text fontWeight="bold" fontSize="lg" mb="md">
          Choisir un ou plusieurs centres:
        </Text>
        <Div row>
          <Radio
            checked={selectedCodeCentres.includes('all')}
            onChange={handleToutChange}
          >
            <Text>Tout</Text>
          </Radio>
          {codeCentres.map((codeCentre) => (
            <Radio
              key={codeCentre}
              checked={selectedCodeCentres.includes(codeCentre)}
              onChange={() => handleCodeCentreChange(codeCentre)}
              ml="lg"
            >
              <Text>{codeCentre}</Text>
            </Radio>
          ))}
        </Div>
      </Div>
      {loading ? (
        <Div flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="green" />
          <Text mt="lg" fontSize="lg" fontWeight="bold" textAlign="center">
            Veuillez ne pas quitter cette page. Le fichier est en cours de téléchargement...
          </Text>
        </Div>
      ) : (
        <Div p="lg" mt="lg">
          <Button
            block
            bg="green600"
            onPress={handleExport}
            disabled={error !== '' || loading}
          >
            <Text color="white" fontWeight="bold">
              Exporter le Rapport
            </Text>
          </Button>
        </Div>
      )}
    </Div>
  );
};

export default RapportGeneral;
