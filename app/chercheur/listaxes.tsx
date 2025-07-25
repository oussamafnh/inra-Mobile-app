import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Button, Input, Div, Text, Header, Icon, ScrollDiv } from 'react-native-magnus';
import { getItem } from '../utils/authToken';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const maxContentWidth = isWeb ? 800 : width * 1;

interface Axe {
  _id: string;
  AXE: string;
  createdAt: string;
  status?: string;
}

export default function ListAxes() {
  const [axes, setAxes] = useState<Axe[]>([]);
  const [megaprojet, setMegaprojet] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { megaprojet_id } = useLocalSearchParams();

  useEffect(() => {
    const fetchAxes = async () => {
      try {
        setLoading(true);
        const storedToken = await getItem('authToken');

        if (!storedToken) {
          router.push('/auth');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/projets/megaprojets/${megaprojet_id}/axes`,
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );

        if (response.data.message === 'User not found') {
          router.push('/auth');
          return;
        }

        if (response.data.message === 'AXEs retrieved successfully') {
          setMegaprojet(response.data.megaprojet || '');
          setAxes(Array.isArray(response.data.data) ? response.data.data : []);
        } else {
          throw new Error('Unexpected response message');
        }
      } catch (error: any) {
        console.error('Error fetching axes:', error.message);
        setError('Failed to fetch axes');
      } finally {
        setLoading(false);
      }
    };

    fetchAxes();
  }, [megaprojet_id, router]);

  const renderAxeItem = (axe: Axe) => {
    const isDisabled = axe.status === 'disabled';
    return (
      <Div
        key={axe._id}
        p="lg"
        mb="md"
        bg="white"
        rounded="md"
        borderWidth={1}
        borderColor="gray300"
        flexDir="row"
        alignItems="center"
        w="100%"
        opacity={isDisabled ? 0.5 : 1}
        shadow={isWeb ? 'sm' : 'none'}
        style={isWeb ? {
          maxWidth: '100%',
          boxSizing: 'border-box',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        } : {}}
        {...(isWeb && {
          onMouseEnter: (e) => {
            if (!isDisabled) {
              e.currentTarget.style.backgroundColor = '#f7fafc';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = 'none';
          }
        })}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
            ...(isWeb && {
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              outline: 'none',
              userSelect: 'none',
            })
          }}
          onPress={() => !isDisabled && router.push(`/chercheur/listactivites?axe_id=${axe._id}&megaprojet_id=${megaprojet_id}`)}
          activeOpacity={0.7}
        >
          <Div w="100%">
            <Text
              fontSize={isWeb ? 'xl' : 'lg'}
              fontWeight="bold"
              numberOfLines={isWeb ? undefined : 2}
              textAlign="left"
              w="100%"
              style={isWeb ? {
                wordWrap: 'break-word',
                lineHeight: '1.4',
              } : {}}
            >
              {axe.AXE}
            </Text>
          </Div>
        </TouchableOpacity>
      </Div>
    );
  };

  return (
    <Div flex={1} bg="gray100" justifyContent="center" alignItems="center">
      {}
      <Header
        p="lg"
        borderBottomWidth={1}
        borderBottomColor="gray200"
        alignment="center"
        bg="white"
        w="100%"
        prefix={
          <TouchableOpacity
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
          </TouchableOpacity>
        }
      >
        <Text
          w="60%"
          numberOfLines={1}
          ellipsizeMode="tail"
          fontSize={isWeb ? '2xl' : 'lg'}
          fontWeight="bold"
        >
          {megaprojet}
        </Text>
      </Header>

      {}
      <Div
        flex={1}
        mt="lg"
        p="lg"
        w={maxContentWidth}
        alignSelf="center"
        maxW="100%"
      >
        {}
        <TouchableOpacity
          style={{
            backgroundColor: '#10b981',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 8,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            ...(isWeb && {
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            })
          }}
          onPress={() => router.push(`/chercheur/chercheractivite`)}
          activeOpacity={0.8}
          {...(isWeb && {
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = '#059669';
              e.currentTarget.style.transform = 'translateY(-1px)';
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
              e.currentTarget.style.transform = 'translateY(0px)';
            }
          })}
        >
          <Icon name="search" fontFamily="Feather" fontSize={isWeb ? 'xl' : 'lg'} color="white" style={{ marginRight: 8 }} />
          <Text color="white" fontWeight="bold" fontSize={isWeb ? 'lg' : 'md'}>
            Chercher une activité avec code
          </Text>
        </TouchableOpacity>

        {}
        <Input
          mb="lg"
          placeholder="Rechercher un axe..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          borderWidth={1}
          rounded="md"
          borderColor="gray300"
          p="md"
          bg="white"
          fontSize={isWeb ? 'md' : 'sm'}
          suffix={
            <Icon
              name="search"
              fontFamily="Feather"
              color="gray500"
              fontSize={isWeb ? 'xl' : 'lg'}
            />
          }
        />

        {}
        <ScrollDiv
          flex={1}
          showsVerticalScrollIndicator={isWeb}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {loading ? (
            <Div flex={1} justifyContent="center" alignItems="center" minH={300}>
              <ActivityIndicator size="large" color="blue" />
            </Div>
          ) : error ? (
            <Div flex={1} justifyContent="center" alignItems="center" minH={300}>
              <Text color="red500" fontSize={isWeb ? 'lg' : 'md'}>{error}</Text>
            </Div>
          ) : axes.length === 0 ? (
            <Div flex={1} justifyContent="center" alignItems="center" minH={300}>
              <Text color="gray700" fontSize={isWeb ? 'lg' : 'md'}>
                Aucun axe trouvé
              </Text>
            </Div>
          ) : (
            axes
              .filter((axe) => axe.AXE?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((axe) => renderAxeItem(axe))
          )}
        </ScrollDiv>
      </Div>
    </Div>
  );
}
