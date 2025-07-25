import React, { useState, useEffect } from 'react';
import { View, ScrollView, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { Div, Text, Header, Button, Icon, Text as MText } from 'react-native-magnus';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';
import { getItem } from '../utils/authToken';
import axios from 'axios';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const maxContentWidth = width;

const ProfileScreen = () => {
  const [logs, setLogs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('last7days');
  const [userId, setUserId] = useState('');
  const [totalHours, setTotalHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const getUserId = async () => {
    try {
      const storedUserId = await getItem('id');
      setUserId(storedUserId || '');
    } catch (err) {
      console.error('Error fetching user ID:', err);
      setError('Failed to fetch user ID');
      setLoading(false);
    }
  };

  const fetchLogs = async (filter) => {
    if (!userId) return;
    try {
      setLoading(true);
      const storedToken = await getItem('authToken');
      if (!storedToken) {
        router.push('/auth');
        setLoading(false);
        return;
      }
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/logs/${filter === 'last7days' ? 'last-7-days' : filter === 'last15days' ? 'last-15-days' : 'user-logs'}?user_id=${userId}`,
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      if (response.data.message === 'User not found') {
        router.push('/auth');
        setLoading(false);
        return;
      }
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setLogs(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to fetch activity logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalHours = async () => {
    try {
      setLoading(true);
      const userId = await getItem('id');
      const storedToken = await getItem('authToken');
      if (!userId || !storedToken) {
        setError('User ID or token not found');
        setLoading(false);
        return;
      }
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/logs/total-hours-7-days?user_id=${userId}`,
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      if (response.data.message === 'User not found') {
        router.push('/auth');
        setLoading(false);
        return;
      }
      const { data } = response.data;
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const day = moment().subtract(i, 'days').format('YYYY-MM-DD');
        const logForDay = data.find((log) => moment(log._id).format('YYYY-MM-DD') === day);
        return {
          day: moment(day).format('DD MMM'),
          totalHours: logForDay ? logForDay.totalHours : 0,
        };
      }).reverse();
      setTotalHours(last7Days);
      setError(null);
    } catch (error) {
      console.error('Error fetching total hours:', error);
      setError('Failed to fetch total hours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchLogs(selectedFilter);
      fetchTotalHours();
    }
  }, [userId, selectedFilter]);

  const groupLogsByDate = () => {
    const groupedLogs = {};
    if (!Array.isArray(logs)) {
      return groupedLogs;
    }
    logs.forEach((log) => {
      const date = moment(log.day).format('DD/MM/YYYY');
      if (!groupedLogs[date]) {
        groupedLogs[date] = [];
      }
      groupedLogs[date].push(log);
    });
    return groupedLogs;
  };

  const groupedLogs = groupLogsByDate();

  return (
    <Div flex={1} bg="gray100" justifyContent="center" alignItems="center">
      <Header
        p="lg"
        borderBottomWidth={1}
        borderBottomColor="gray200"
        alignment="center"
        bg="white"
        w="100%"
        style={isWeb ? {
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        } : {}}
        prefix={
          <Button
            bg="transparent"
            onPress={() => router.back()}
            style={isWeb ? {
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              transition: 'all 0.2s ease',
            } : {}}
            {...(isWeb && {
              onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = '#f7fafc';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            })}
          >
            <Icon name="arrow-left" fontFamily="Feather" fontSize={isWeb ? '3xl' : '2xl'} />
          </Button>
        }
      >
        <Text fontSize={isWeb ? '2xl' : 'xl'} fontWeight="bold">
          Profil
        </Text>
      </Header>
      {loading ? (
        <Div flex={1} justifyContent="center" alignItems="center" minH={300}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text mt="md" color="gray600" fontSize={isWeb ? 'lg' : 'md'}>
            Chargement...
          </Text>
        </Div>
      ) : error ? (
        <Div flex={1} justifyContent="center" alignItems="center" minH={300}>
          <Icon name="alert-circle" fontFamily="Feather" fontSize="4xl" color="red500" mb="md" />
          <Text
            color="red500"
            textAlign="center"
            fontSize={isWeb ? 'lg' : 'md'}
            fontWeight="bold"
          >
            {error}
          </Text>
        </Div>
      ) : (
        <ScrollView
          style={{
            width: '100%',
            maxWidth: maxContentWidth,
            alignSelf: 'center',
            paddingHorizontal: isWeb ? 20 : 10,
            overflowY: isWeb ? 'auto' : 'visible',
          }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 20,
            minHeight: isWeb ? '100%' : undefined,
          }}
        >
          <MText fontSize={isWeb ? 'xl' : 'lg'} fontWeight="bold" mb="lg" mt="lg">
            Heures totales des 7 derniers jours
          </MText>
          <LineChart
            data={{
              labels: totalHours.map((log) => log.day),
              datasets: [
                {
                  data: totalHours.map((log) => log.totalHours),
                },
              ],
            }}
            width={maxContentWidth}
            height={220}
            yAxisSuffix="h"
            chartConfig={{
              backgroundColor: '#C2FFC7',
              backgroundGradientFrom: '#C2FFC7',
              backgroundGradientTo: '#C2FFC7',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#3366FF',
              },
            }}
            style={{
              borderRadius: 16,
              marginBottom: 16,
              alignSelf: 'center',
              width: '100%',
            }}
          />
          <MText fontSize={isWeb ? 'xl' : 'lg'} fontWeight="bold" mb="md">
            Historiques
          </MText>
          <Div flexDir={isWeb ? 'row' : 'column'} alignItems={isWeb ? 'center' : 'stretch'} mb="lg">
            {['last7days', 'last15days', 'all'].map((filter) => (
              <Button
                key={filter}
                bg={selectedFilter === filter ? 'green500' : 'gray200'}
                onPress={() => setSelectedFilter(filter)}
                p="md"
                mr={isWeb ? 10 : 0}
                mb={isWeb ? 0 : 10}
                rounded="md"
                w={isWeb ? undefined : '100%'}
                style={isWeb ? {
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                } : {}}
                {...(isWeb && {
                  onMouseEnter: (e) => {
                    if (selectedFilter !== filter) {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }
                  },
                  onMouseLeave: (e) => {
                    if (selectedFilter !== filter) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }
                })}
              >
                <MText
                  color={selectedFilter === filter ? 'white' : 'black'}
                  fontSize={isWeb ? 'md' : 'sm'}
                  fontWeight="bold"
                >
                  {filter === 'last7days' ? 'Derniers 7 jours' : filter === 'last15days' ? 'Derniers 15 jours' : 'Tout'}
                </MText>
              </Button>
            ))}
          </Div>
          {Object.keys(groupedLogs).length > 0 ? (
            Object.keys(groupedLogs).map((date) => (
              <View key={date} style={{ marginBottom: 20, width: '100%' }}>
                <MText fontSize={isWeb ? 'xl' : 'lg'} fontWeight="bold" mb="sm">
                  {date}
                </MText>
                {groupedLogs[date].map((log) => (
                  <Div
                    key={log._id}
                    p="lg"
                    mb="md"
                    rounded="md"
                    bg="white"
                    borderWidth={1}
                    borderColor="gray300"
                    flexDir="row"
                    alignItems="center"
                    justifyContent="space-between"
                    w="100%"
                    shadow={isWeb ? 'sm' : 'none'}
                    style={isWeb ? {
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                    } : {}}
                    {...(isWeb && {
                      onMouseEnter: (e) => {
                        e.currentTarget.style.backgroundColor = '#f7fafc';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      },
                      onMouseLeave: (e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    })}
                  >
                    <Div flex={4.4} mr="md">
                      <Text
                        fontSize={isWeb ? '2xl' : 'lg'}
                        fontWeight="bold"
                        color="gray700"
                        numberOfLines={isWeb ? undefined : 2}
                        style={isWeb ? { wordWrap: 'break-word', lineHeight: '1.4' } : {}}
                      >
                        {log.activite_name}
                      </Text>
                    </Div>
                    <Div flex={1}>
                      <Text
                        fontSize={isWeb ? 'lg' : 'md'}
                        textAlign="right"
                        color="gray700"
                        numberOfLines={isWeb ? undefined : 1}
                        style={isWeb ? { wordWrap: 'break-word' } : {}}
                      >
                        {log.activite_code}
                      </Text>
                    </Div>
                    <Div
                      position="absolute"
                      bg="gray300"
                      w={1}
                      h="60%"
                      left="85%"
                    />
                    <Div flex={1.2}>
                      <Text
                        fontSize={isWeb ? 'lg' : 'md'}
                        textAlign="right"
                        color="gray700"
                        numberOfLines={1}
                      >
                        {log.value} hrs
                      </Text>
                    </Div>
                  </Div>
                ))}
              </View>
            ))
          ) : (
            <Div flex={1} justifyContent="center" alignItems="center" minH={200}>
              <Icon name="folder" fontFamily="Feather" fontSize="4xl" color="gray400" mb="md" />
              <Text
                color="gray700"
                fontSize={isWeb ? 'lg' : 'md'}
                textAlign="center"
                fontWeight="bold"
              >
                Aucune activité trouvée.
              </Text>
            </Div>
          )}
        </ScrollView>
      )}
    </Div>
  );
};

export default ProfileScreen;
