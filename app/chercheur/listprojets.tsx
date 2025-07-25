import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Button, Input, Div, Text, Header, Icon, ScrollDiv } from 'react-native-magnus';
import { getItem } from '../utils/authToken';
import { useRouter } from 'expo-router';
import axios from 'axios';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const maxContentWidth = isWeb ? 800 : width * 1;

interface Megaprojet {
  _id: string;
  MEGAPROJET: string;
  filiere: string;
  CRRA: string;
  COORDINATEUR: string;
  createdAt: string;
  status: string;
}

export default function ListProjets() {
  const [megaprojets, setMegaprojets] = useState<Megaprojet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchMegaprojets = async () => {
      try {
        setLoading(true);
        const storedToken = await getItem('authToken');

        if (!storedToken) {
          router.push('/auth');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/projets/megaprojets`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (
          response.data.message === 'User not found' ||
          response.data.message === 'No auth token provided'
        ) {
          router.push('/auth');
          setLoading(false);
          return;
        }

        const data = response.data.data;
        setMegaprojets(Array.isArray(data) ? data : []);
      } catch (error: any) {
        setError('Failed to fetch megaprojets');
      } finally {
        setLoading(false);
      }
    };

    fetchMegaprojets();
  }, [router]);

  const renderMegaprojetItem = (megaprojet: Megaprojet) => {
    const isDisabled = megaprojet.status === 'disabled';
    return (
      <Div
        key={megaprojet._id}
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
          onPress={() => !isDisabled && router.push(`/chercheur/listaxes?megaprojet_id=${megaprojet._id}`)}
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
              {megaprojet.MEGAPROJET}
            </Text>
            <Text
              fontSize={isWeb ? 'md' : 'sm'}
              color="gray700"
              mt="xs"
              numberOfLines={isWeb ? undefined : 2}
              textAlign="left"
              w="100%"
              style={isWeb ? {
                wordWrap: 'break-word',
                lineHeight: '1.3',
              } : {}}
            >
              Filière: {megaprojet.filiere}
            </Text>
          </Div>
        </TouchableOpacity>
      </Div>
    );
  };

  return (
    <Div
      flex={1}
      bg="gray100"
      justifyContent="center"
      alignItems="center"
      style={isWeb ? {
        minHeight: '100vh',
        maxWidth: '100vw',
        overflow: 'hidden',
      } : {}}
    >
      {}
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
        <Text fontSize={isWeb ? '2xl' : 'xl'} fontWeight="bold">
          Liste des Mégaprojets
        </Text>
      </Header>

      {}
      <Div
        flex={1}
        mt="lg"
        px="lg"
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
        <Div mt="lg" mb="md">
          <Input
            placeholder="Rechercher un mégaprojet..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            borderWidth={1}
            borderColor="gray300"
            rounded="md"
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
            style={isWeb ? {
              fontSize: 16,
              outline: 'none',
              transition: 'all 0.2s ease',
            } : {}}
            focusedBorderColor="blue500"
          />
        </Div>

        {}
        <ScrollDiv
          flex={1}
          showsVerticalScrollIndicator={isWeb}
          style={isWeb ? {
            overflow: 'auto',
            paddingBottom: 0,
            marginBottom: 0,
          } : {}}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
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
              <Text color="red500" textAlign="center" fontSize={isWeb ? 'lg' : 'md'}>
                {error}
              </Text>
            </Div>
          ) : megaprojets.length === 0 ? (
            <Div flex={1} justifyContent="center" alignItems="center" minH={300}>
              <Icon name="folder" fontFamily="Feather" fontSize="4xl" color="gray400" mb="md" />
              <Text color="gray700" fontSize={isWeb ? 'lg' : 'md'}>
                Aucun mégaprojet trouvé
              </Text>
            </Div>
          ) : (
            <Div pb="md">
              {megaprojets
                .filter((megaprojet) =>
                  megaprojet.MEGAPROJET &&
                  megaprojet.MEGAPROJET.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((megaprojet) => renderMegaprojetItem(megaprojet))}
            </Div>
          )}
        </ScrollDiv>
      </Div>
    </Div>
  );
}
