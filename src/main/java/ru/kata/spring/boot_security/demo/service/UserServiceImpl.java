package ru.kata.spring.boot_security.demo.service;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.UserRepository;

import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passEncoder) {
        this.userRepository = userRepository;
        this.passEncoder = passEncoder;
    }

    private User encryptPassword(User user) {
        user.setPassword(passEncoder.encode(user.getPassword()));
        return user;
    }

    @Override
    @Transactional
    public void saveUser(User user) {
        userRepository.save(encryptPassword(user));
    }

    @Override
    @Transactional
    public void removeUserById(Long id) {
        userRepository.deleteById(id);
    }


    @Override
    @Transactional
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        users.forEach(user -> Hibernate.initialize(user.getRoles()));
        return users;
    }

    @Override
    public User getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user Id:" + id));
        Hibernate.initialize(user.getRoles());
        return user;
    }

    @Override
    public User getUserByLogin(String login) {
        return userRepository.getUserByLogin(login);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        User user = getUserByLogin(login);
        if (user == null) {
            throw new UsernameNotFoundException(String.format("Пользователь  не существует", login));
        }
        return user;
    }
}