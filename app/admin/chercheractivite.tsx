import React, { useState } from 'react';
import { Div, Input, Button, Text, ScrollDiv, Header, Icon } from 'react-native-magnus';
import { ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const ChercherActivite = () => {
    const [activityCode, setActivityCode] = useState('');
    const [activities, setActivities] = useState<any[]>([]);
    const [activityLoading, setActivityLoading] = useState(false);
    const [activityError, setActivityError] = useState<string | null>(null);
    const router = useRouter();

    const fetchActivitiesByCode = async () => {
        setActivityError(null);
        setActivityLoading(true);

        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/projets/activite/${activityCode}`
            );

            if (response.status === 200 && response.data.data) {
                const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
                setActivities(data);
            } if (response.data.message === "User not found") {
                router.push('/auth');
                return;
            }
            else {
                setActivityError('No activities found');
            }
        } catch (error) {
            setActivityError('Failed to fetch activities');
        } finally {
            setActivityLoading(false);
        }
    };

    return (
        <Div flex={1}>
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
                <Text numberOfLines={1} ellipsizeMode="tail" fontSize="lg" fontWeight="bold">
                    Chercher une activite
                </Text>
            </Header>

            {}
            <Div alignItems="center" mb="lg" p="lg">
                <Input
                    placeholder="Rechercher une activité par code..."
                    value={activityCode}
                    onChangeText={setActivityCode}
                    onEndEditing={fetchActivitiesByCode}
                    borderWidth={1}
                    rounded="md"
                    borderColor="gray300"
                    p="md"
                    bg="white"
                    mb="md"
                />
                <Button
                    onPress={fetchActivitiesByCode}
                    w="100%"
                    p="md"
                    bg="green500"
                    rounded="md"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Text color="white">Search</Text>
                </Button>
            </Div>

            {}
            {activityLoading ? (
                <Div flex={1} justifyContent="center" alignItems="center">
                    <ActivityIndicator size="large" color="blue" />
                </Div>
            ) : activityError ? (
                <Div flex={1} justifyContent="center" alignItems="center">
                    <Text color="red500">{activityError}</Text>
                </Div>
            ) : activities.length > 0 ? (
                <ScrollDiv flex={1} showsVerticalScrollIndicator={false}>
                    <Div flex={1} justifyContent="center" alignItems="center">
                        {activities.map((activity) => (
                            <Button
                                key={activity._id}
                                ml="3%"
                                w="94%"
                                p="lg"
                                mb="md"
                                rounded="md"
                                flexDir="row"
                                alignItems="center"
                                justifyContent="space-between"
                                bg="white"
                                borderWidth={1}
                                borderColor="gray300"
                            >
                                <Div flexDir="row" alignItems="center" justifyContent="space-between" flex={1}>
                                    {}
                                    <Div flex={8} mr="md">
                                        <Text fontSize="2xl" fontWeight="bold">{activity.ACTIVITE}</Text>
                                    </Div>

                                    {}
                                    <Div position="absolute" bg="black" w={1} h="100%" left="80%" />

                                    {}
                                    <Div flex={2}>
                                        <Text fontSize="xl" textAlign="right" color="gray700">{activity.CodeActivite}</Text>
                                    </Div>
                                </Div>
                            </Button>
                        ))}
                    </Div>
                </ScrollDiv>

            ) : (
                <Div flex={1} justifyContent="center" alignItems="center">
                    <Text>No activities found</Text>
                </Div>
            )}
        </Div>
    );
};

export default ChercherActivite;
