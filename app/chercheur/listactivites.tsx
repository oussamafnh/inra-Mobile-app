import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { Button, Input, Div, Text, Header, Icon, ScrollDiv } from 'react-native-magnus';
import { saveItem, getItem, deleteItem } from '../utils/authToken';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

interface Activite {
    _id: string;
    ACTIVITE: string;
    createdAt: string;
    status: string;
    CodeActivite?: string;
}

export default function ListAxes() {
    const [activities, setActivities] = useState<Activite[]>([]);
    const [megaprojet, setMegaprojet] = useState('');
    const [megaprojetId, setMegaprojetId] = useState('');
    const [axe, setAxe] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const { axe_id } = useLocalSearchParams();

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
                    `${process.env.EXPO_PUBLIC_API_URL}/projets/megaprojets/axe/${axe_id}/activites`,
                    {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    }
                );

                if (response.data.message === "User not found") {
                    router.push('/auth');
                    return;
                }

                if (response.data.message === "ACTIVITEs retrieved successfully") {
                    setMegaprojet(response.data.megaprojet);
                    setMegaprojetId(response.data.megaprojet_id);
                    setAxe(response.data.axe);
                    setActivities(Array.isArray(response.data.data) ? response.data.data : []);
                } else {
                    throw new Error('Failed to fetch activities');
                }
            } catch (error: any) {
                console.error('Error fetching activities:', error.message);
                setError('Failed to fetch activities');
            } finally {
                setLoading(false);
            }
        };

        fetchAxes();
    }, [axe_id, router]);

    const renderActivityItem = (activity: Activite) => {
        const isDisabled = activity.status === 'disabled';

        return (
            <TouchableOpacity
                key={activity._id}
                disabled={isDisabled}
                onPress={() => {
                    if (!isDisabled) {
                        router.push(
                            `/chercheur/insertiondedonnee?megaprojet_id=${megaprojetId}&megaprojet_name=${megaprojet}&axe_id=${axe_id}&axe_name=${axe}&activite_id=${activity._id}&activite_name=${activity.ACTIVITE}`
                        );
                    }
                }}
                activeOpacity={isDisabled ? 1 : 0.7}
                style={{
                    padding: 16,
                    marginBottom: 12,
                    borderRadius: 8,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    opacity: isDisabled ? 0.5 : 1,
                    ...(Platform.OS === 'web' && {
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
                        outline: 'none',
                        userSelect: 'none',
                    })
                }}
                {...(Platform.OS === 'web' && !isDisabled && {
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
                <Div
                    flexDir="row"
                    alignItems="center"
                    justifyContent="space-between"
                    flex={1}
                    style={Platform.OS === 'web' ? {
                        overflow: 'hidden',
                    } : {}}
                >
                    {}
                    <Div
                        flex={activity.CodeActivite ? (Platform.OS === 'web' ? 3 : 8) : 1}
                        mr={activity.CodeActivite ? "md" : 0}
                        style={Platform.OS === 'web' ? {
                            minWidth: 0,
                        } : {}}
                    >
                        <Text
                            fontSize="2xl"
                            fontWeight="bold"
                            numberOfLines={Platform.OS === 'web' ? undefined : 2}
                            style={Platform.OS === 'web' ? {
                                wordWrap: 'break-word',
                                lineHeight: '1.3',
                                overflow: 'hidden',
                            } : {}}
                        >
                            {activity.ACTIVITE}
                        </Text>
                    </Div>

                    {}
                    {activity.CodeActivite && (
                        <>
                            {}
                            <Div
                                w={1}
                                h={50}
                                bg="gray300"
                                mx="md"
                                style={Platform.OS === 'web' ? {
                                    flexShrink: 0,
                                } : {}}
                            />

                            {}
                            <Div
                                flex={Platform.OS === 'web' ? 1 : 2}
                                alignItems="flex-end"
                                style={Platform.OS === 'web' ? {
                                    minWidth: 80,
                                    flexShrink: 0,
                                } : {}}
                            >
                                <Text
                                    fontSize="xl"
                                    fontWeight="600"
                                    color="gray700"
                                    style={Platform.OS === 'web' ? {
                                        fontFamily: 'monospace',
                                        letterSpacing: '0.5px',
                                    } : {}}
                                >
                                    {activity.CodeActivite}
                                </Text>
                            </Div>
                        </>
                    )}
                </Div>

                {}
                {isDisabled && (
                    <Div
                        position="absolute"
                        top={0}
                        right={8}
                        bg="red500"
                        px="sm"
                        py="xs"
                        rounded="sm"
                    >
                        <Text color="white" fontSize="xs" fontWeight="bold">
                            DÉSACTIVÉ
                        </Text>
                    </Div>
                )}
            </TouchableOpacity>
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
            {}
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
                <Text
                    fontSize="lg"
                    fontWeight="bold"
                    numberOfLines={Platform.OS === 'web' ? 2 : 1}
                    textAlign="center"
                    style={Platform.OS === 'web' ? {
                        maxWidth: '70%',
                        wordWrap: 'break-word',
                        lineHeight: '1.3',
                    } : { width: '60%' }}
                    ellipsizeMode="tail"
                >
                    {axe}
                </Text>
            </Header>

            {}
            <Div
                flex={1}
                mt="lg"
                p="lg"
                style={Platform.OS === 'web' ? {
                    maxWidth: Platform.OS === 'web' ? '1200px' : undefined,
                    alignSelf: 'center',
                    width: '100%',
                    boxSizing: 'border-box',
                } : {}}
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
                        ...(Platform.OS === 'web' && {
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            outline: 'none',
                        })
                    }}
                    onPress={() => router.push(`/chercheur/chercheractivite`)}
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
                    <Icon name="search" fontFamily="Feather" fontSize="lg" color="white" style={{ marginRight: 8 }} />
                    <Text color="white" fontWeight="bold" fontSize="md">
                        Chercher une activite avec code
                    </Text>
                </TouchableOpacity>

                {}
                <Div
                    mb="lg"
                    style={Platform.OS === 'web' ? {
                        position: 'relative',
                    } : {}}
                >
                    <Input
                        placeholder="Rechercher une activite..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        borderWidth={1}
                        rounded="md"
                        borderColor="gray300"
                        p="md"
                        bg="white"
                        suffix={
                            <Icon
                                name="search"
                                fontFamily="Feather"
                                color="gray500"
                                fontSize="lg"
                            />
                        }
                        style={Platform.OS === 'web' ? {
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
                    showsVerticalScrollIndicator={false}
                    style={Platform.OS === 'web' ? {
                        overflow: 'auto',
                        paddingRight: 4,
                    } : {}}
                >
                    {loading ? (
                        <Div flex={1} justifyContent="center" alignItems="center" style={{ minHeight: 200 }}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text mt="md" color="gray600">Chargement des activités...</Text>
                        </Div>
                    ) : error ? (
                        <Div flex={1} justifyContent="center" alignItems="center" style={{ minHeight: 200 }}>
                            <Icon name="alert-circle" fontFamily="Feather" fontSize="4xl" color="red500" mb="md" />
                            <Text color="red500" textAlign="center" fontSize="md">
                                {error}
                            </Text>
                        </Div>
                    ) : activities.length === 0 ? (
                        <Div flex={1} justifyContent="center" alignItems="center" style={{ minHeight: 200 }}>
                            <Icon name="activity" fontFamily="Feather" fontSize="4xl" color="gray400" mb="md" />
                            <Text color="gray700" fontSize="md" textAlign="center">
                                Aucune activité trouvée pour cet axe
                            </Text>
                        </Div>
                    ) : (
                        <Div>
                            {activities
                                .filter((activity) =>
                                    activity.ACTIVITE.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((activity) => renderActivityItem(activity))}
                        </Div>
                    )}
                </ScrollDiv>
            </Div>
        </Div>
    );
}
