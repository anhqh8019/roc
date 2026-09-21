package org.venusgiti.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.venusgiti.dto.RoomDetailResponse;
import org.venusgiti.dto.RoomStatusResponse;
import org.venusgiti.repository.SmileRoomRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final SmileRoomRepository roomRepository;

    public List<RoomStatusResponse> getCurrentRooms() {
        return roomRepository.getCurrentRooms();
    }

    public RoomDetailResponse getRoomDetail(
            String roomCode
    ) {
        return roomRepository.getRoomDetail(roomCode);
    }
}