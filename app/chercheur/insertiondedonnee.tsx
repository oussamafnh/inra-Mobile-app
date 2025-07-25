import React, { useState, useEffect } from 'react';
import { Button, Div, Input, Text, Header, Icon, ScrollDiv } from 'react-native-magnus';
import { ActivityIndicator, Platform, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { saveItem, getItem, deleteItem } from '../utils/authToken';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TouchableOpacity } from 'react-native';

export default function InsertionDeDonnee() {
  const [megaprojetName, setMegaprojetName] = useState('');
  const [axeName, setAxeName] = useState('');
  const [activiteName, setActiviteName] = useState('');
  const [hoursWorked, setHoursWorked] = useState<number | string>('');
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [subbmitloading, setsubbmitLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const router = useRouter();
  const { megaprojet_id, megaprojet_name, axe_id, axe_name, activite_id, activite_name: activityName } = useLocalSearchParams();

  useEffect(() => {
    const checkIfAllowed = async (checkDate: Date) => {
      try {
        setLoading(true);
        const storedToken = await getItem('authToken');
        const storedid = await getItem('id');

        if (!storedToken) {
          router.push('/auth');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/logs/activity-log/check?activite_id=${activite_id}&day=${checkDate.toISOString().split('T')[0]}&user_id=${storedid}&megaprojet_id=${megaprojet_id}&axe_id=${axe_id}`,
          {
            headers: { Authorization: `Bearer ${storedToken}` }
          }
        );

        if (response.data.message === "User not found") {
          router.push('/auth');
          return;
        }

        if (response.data.message === "allowed") {
          setIsAllowed(true);
          setHoursWorked('');
        } else {
          setIsAllowed(false);
          setHoursWorked(response.data.data.value.toString());
        }

        setLoading(false);
      } catch (error) {
        setError('Erreur lors de la vérification.');
        setLoading(false);
      }
    };

    checkIfAllowed(date);
  }, [activite_id, megaprojet_id, axe_id, router, date]);

  const handleSubmit = async () => {
    if (isAllowed && hoursWorked !== '') {
      setsubbmitLoading(true);
      setSuccess(true);
      try {
        const storedToken = await getItem('authToken');
        const storedid = await getItem('id');
        const storedfullName = await getItem('fullName');

        const value = Number(hoursWorked);
        if (isNaN(value)) {
          setError('La valeur des heures doit être un nombre valide.');
          setsubbmitLoading(false);
          return;
        }

        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/logs/activity-log`,
          {
            activite_id,
            megaprojet_id,
            user_full_name: storedfullName,
            axe_id,
            user_id: storedid,
            value: value,
            day: date.toISOString().split('T')[0],
          },
          {
            headers: { Authorization: `Bearer ${storedToken}` }
          }
        );
        if (response.data.message === "User not found") {
          router.push('/auth');
          return;
        }
        if (response.data.message === 'Activity log created successfully.') {
          setSuccessMessage('Heures ajoutées avec succès');
        } else {
          setError('Échec de l\'ajout des heures');
          setSuccess(false);
        }
      } catch (error) {
        setError('Erreur lors de la soumission des données.');
      } finally {
        setsubbmitLoading(false);
        setTimeout(() => {
          router.back();
        }, 1000);
      }
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date | undefined) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setDatePickerVisible(false);

    checkIfAllowed(currentDate);
  };

  return (
    <Div flex={1} bg="gray100">
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
        <Text fontSize="lg" fontWeight="bold">Insertion des données</Text>
      </Header>

      <Div flex={1} p="lg" mt="lg">
        {loading ? (
          <Div flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color="blue" />
          </Div>
        ) : (
          <>
            <Text fontSize="3xl" fontWeight="bold" mb="lg" mt="xxl">
              Megaprojet :
            </Text>
            <ScrollDiv flex={1} showsVerticalScrollIndicator={false}>
              <Input
                mb="lg"
                placeholder="Nom du mégaprojet"
                value={megaprojet_name}
                editable={false}
                borderWidth={1}
                rounded="md"
                borderColor="gray300"
                p="md"
                bg="white"
                borderColor="green500"
                textColor="green500"
                multiline
                style={{
                  textAlignVertical: 'top',
                  minHeight: 40,
                }}
              />
              <Text fontSize="3xl" fontWeight="bold" mb="lg" mt="xxl">
                Axe :
              </Text>
              <Input
                mb="lg"
                placeholder="Nom de l'axe"
                value={axe_name}
                editable={false}
                borderWidth={1}
                rounded="md"
                borderColor="gray300"
                p="md"
                bg="white"
                borderColor="green500"
                textColor="green500"
                multiline
                style={{
                  textAlignVertical: 'top',
                  minHeight: 40,
                }}
              />
              <Text fontSize="3xl" fontWeight="bold" mb="lg" mt="xxl">
                Activité :
              </Text>
              <Input
                mb="lg"
                placeholder="Nom de l'activité"
                value={activityName}
                editable={false}
                borderWidth={1}
                rounded="md"
                borderColor="gray300"
                p="md"
                bg="white"
                borderColor="green500"
                textColor="green500"
                multiline
                style={{
                  textAlignVertical: 'top',
                  minHeight: 40,
                }}
              />
              <Text fontSize="3xl" fontWeight="bold" mb="lg" mt="xxl">
                Date :
              </Text>

              <TouchableOpacity onPress={() => {
                setDatePickerVisible(true);
              }}>
                <Input
                  mb="lg"
                  placeholder="Date"
                  value={date.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  editable={false}
                  borderWidth={1}
                  rounded="md"
                  borderColor="gray300"
                  p="md"
                  bg="white"
                  borderColor="green500"
                  textColor="green500"
                />
              </TouchableOpacity>

              {datePickerVisible && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}

              <Text fontSize="3xl" fontWeight="bold" mb="lg" mt="xxl">
                Heures travaillées :
              </Text>
              <Input
                mb="lg"
                placeholder="Entrez les heures"
                value={hoursWorked}
                keyboardType="numeric"
                onChangeText={(text) => setHoursWorked(text)}
                borderWidth={1}
                rounded="md"
                borderColor="gray300"
                p="md"
                bg="white"
                borderColor="green500"
                textColor="green500"
                editable={isAllowed}
              />

              {subbmitloading ? (
                <ActivityIndicator size="large" color="blue" />
              ) : (
                <Button
                  bg={isAllowed ? "green500" : "gray900"}
                  color="white"
                  block
                  onPress={handleSubmit}
                  disabled={!isAllowed}
                >
                  {isAllowed ? "Valider" : "Déjà entré"}
                </Button>
              )}

              {error && <Text color="red500">{error}</Text>}
              {success && <Text color="green500">{successMessage}</Text>}
            </ScrollDiv>
          </>
        )}
      </Div>
    </Div>
  );
}
