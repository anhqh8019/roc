package org.venusgiti.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.venusgiti.dto.RoomDetailResponse;
import org.venusgiti.dto.RoomStatusResponse;
import org.venusgiti.service.RoomService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hotel")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/rooms")
    public List<RoomStatusResponse> getRooms() {
        return roomService.getCurrentRooms();
    }

    @GetMapping("/rooms/{roomCode}")
    public RoomDetailResponse getRoomDetail(
            @PathVariable String roomCode
    ) {
        return roomService.getRoomDetail(roomCode);
    }
}