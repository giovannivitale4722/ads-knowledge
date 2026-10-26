CXX ?= c++
CXXFLAGS ?= -std=c++17 -O2 -Wall -Wextra -pedantic
BUILD := build

SIM_SRCS := src/main.cpp src/simulate.cpp src/tcpa_bidder.cpp
TEST_SRCS := src/tests.cpp src/tcpa_bidder.cpp
HEADERS := $(wildcard src/*.hpp)

.PHONY: all run test clean

all: $(BUILD)/sim $(BUILD)/tests

$(BUILD)/sim: $(SIM_SRCS) $(HEADERS) | $(BUILD)
	$(CXX) $(CXXFLAGS) $(SIM_SRCS) -o $@

$(BUILD)/tests: $(TEST_SRCS) $(HEADERS) | $(BUILD)
	$(CXX) $(CXXFLAGS) $(TEST_SRCS) -o $@

$(BUILD):
	mkdir -p $(BUILD)

run: $(BUILD)/sim
	./$(BUILD)/sim

test: $(BUILD)/tests
	./$(BUILD)/tests

clean:
	rm -rf $(BUILD) results
