import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { Button, Input, Div, Text, Header, Icon, ScrollDiv } from 'react-native-magnus';
import { getItem } from '../utils/authToken';
import { useRouter } from 'expo-router';
import axios from 'axios';

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
          return;
        }

        setMegaprojets(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch megaprojets');
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
        style={Platform.OS === 'web' ? {
          maxWidth: '100%',
          boxSizing: 'border-box',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        } : {}}
        {...(Platform.OS === 'web' && {
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
        <TouchableOpacity
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
            ...(Platform.OS === 'web' && {
              cursor: 'pointer',
              outline: 'none',
              userSelect: 'none',
            })
          }}
          onPress={() => router.push(`/admin/listaxes?megaprojet_id=${megaprojet._id}`)}
          activeOpacity={0.7}
        >
          <Div w="100%">
            <Text
              fontSize="lg"
              fontWeight="bold"
              numberOfLines={2}
              textAlign="left"
              w="100%"
              style={Platform.OS === 'web' ? {
                wordWrap: 'break-word',
                lineHeight: '1.4',
              } : {}}
            >
              {megaprojet.MEGAPROJET}
            </Text>
            <Text
              fontSize="sm"
              color="gray700"
              mt="xs"
              numberOfLines={2}
              textAlign="left"
              w="100%"
              style={Platform.OS === 'web' ? {
                wordWrap: 'break-word',
                lineHeight: '1.3',
              } : {}}
            >
              Filière: {megaprojet.filiere}
            </Text>
          </Div>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 48,
            minHeight: 48,
            ...(Platform.OS === 'web' && {
              cursor: 'pointer',
              borderRadius: 8,
              transition: 'all 0.2s ease',
            })
          }}
          onPress={() => {
            const params = {
              megaprojet_id: megaprojet._id,
              MEGAPROJET: megaprojet.MEGAPROJET,
              filiere: megaprojet.filiere,
              COORDINATEUR: megaprojet.COORDINATEUR,
              status: megaprojet.status,
            };
            router.push({
              pathname: '/admin/editMegaProjet',
              params: params,
            });
          }}
          activeOpacity={0.7}
          {...(Platform.OS === 'web' && {
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          })}
        >
          <Icon name="edit" fontSize="xl" color="blue600" />
        </TouchableOpacity>
      </Div>
    );
  };

  return (
    <Div
      flex={1}
      bg="gray100"
      style={Platform.OS === 'web' ? {
        minHeight: '100vh',
        maxWidth: '100vw',
        overflow: 'hidden',
      } : {}}
    >
      <Header
        p="lg"
        borderBottomWidth={1}
        borderBottomColor="gray200"
        alignment="center"
        bg="white"
        style={Platform.OS === 'web' ? {
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        } : {}}
        prefix={
          <TouchableOpacity
            onPress={() => router.back()}
            style={Platform.OS === 'web' ? {
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              transition: 'all 0.2s ease',
            } : {}}
            {...(Platform.OS === 'web' && {
              onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = '#f7fafc';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            })}
          >
            <Icon name="arrow-left" fontFamily="Feather" fontSize="2xl" />
          </TouchableOpacity>
        }
      >
        <Text fontSize="xl" fontWeight="bold">List des Mégaprojets</Text>
      </Header>

      <Div
        flex={1}
        mt="lg"
        px="lg"
        style={Platform.OS === 'web' ? {
          maxWidth: '1200px',
          alignSelf: 'center',
          width: '100%',
          boxSizing: 'border-box',
        } : {}}
      >
        <TouchableOpacity
          style={{
            backgroundColor: '#10b981',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            ...(Platform.OS === 'web' && {
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            })
          }}
          onPress={() => router.push('/admin/addmegaprojet')}
          activeOpacity={0.8}
          {...(Platform.OS === 'web' && {
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
          <Icon name="plus" fontFamily="Feather" fontSize="lg" color="white" style={{ marginRight: 8 }} />
          <Text color="white" fontWeight="bold" fontSize="md">
            Ajouter un mégaprojet
          </Text>
        </TouchableOpacity>

        <Div mt="lg" mb="md">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            borderColor="gray300"
            rounded="md"
            prefix={<Icon name="search" fontFamily="Feather" fontSize="lg" />}
            style={Platform.OS === 'web' ? {
              fontSize: 16,
              outline: 'none',
              transition: 'all 0.2s ease',
            } : {}}
            focusedBorderColor="blue500"
          />
        </Div>

        <ScrollDiv
          flex={1}
          showsVerticalScrollIndicator={false}
          style={Platform.OS === 'web' ? {
            overflow: 'auto',
            paddingBottom: 0,
            marginBottom: 0,
          } : {}}
        >
          {loading ? (
            <Div flex={1} justifyContent="center" alignItems="center" style={{ minHeight: 200 }}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text mt="md" color="gray600">Chargement...</Text>
            </Div>
          ) : error ? (
            <Div flex={1} justifyContent="center" alignItems="center" style={{ minHeight: 200 }}>
              <Icon name="alert-circle" fontFamily="Feather" fontSize="4xl" color="red500" mb="md" />
              <Text color="red500" textAlign="center" fontSize="md">
                {error}
              </Text>
            </Div>
          ) : megaprojets.length === 0 ? (
            <Div flex={1} justifyContent="center" alignItems="center" style={{ minHeight: 200 }}>
              <Icon name="folder" fontFamily="Feather" fontSize="4xl" color="gray400" mb="md" />
              <Text color="gray700" fontSize="md">Aucun mégaprojet trouvé</Text>
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
